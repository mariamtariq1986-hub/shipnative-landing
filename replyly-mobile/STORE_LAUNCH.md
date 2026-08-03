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

**EAS project (live):** [@mariamtariq/replyly](https://expo.dev/accounts/mariamtariq/projects/replyly)  
**projectId:** `f7976a6e-92d4-46b0-82fd-c2487ff958e5`

---

## Status snapshot (2026-08-03)

| Step | Status |
|------|--------|
| `eas whoami` | Logged in as **mariamtariq** |
| EAS project linked | Done (`projectId` in `app.config.ts`) |
| Typecheck + `expo export` smoke | Passed |
| **Android production build** | **Queued** → [build 9c5a9d34…](https://expo.dev/accounts/mariamtariq/projects/replyly/builds/9c5a9d34-bad4-4068-a01a-83fa199d0a8e) |
| **iOS production build** | Blocked — Apple credentials need interactive setup (see §2b) |
| Apple $99 / Play $25 enroll | **You must pay & complete identity** |
| Store submit | After builds succeed + store listings ready |

### Dashboard links

- All builds: https://expo.dev/accounts/mariamtariq/projects/replyly/builds  
- Credentials: https://expo.dev/accounts/mariamtariq/projects/replyly/credentials  
- Android build (in progress): https://expo.dev/accounts/mariamtariq/projects/replyly/builds/9c5a9d34-bad4-4068-a01a-83fa199d0a8e  

---

## 0) Run locally first (sanity check)

```bash
cd replyly-mobile
npm install
npx expo start
```

Then:

1. Scan the QR with **Expo Go** (same Wi‑Fi), or press `a` / `i` for emulator.
2. Entry must be `expo-router/entry` in `package.json`.
3. Scheme: `replyly` · Bundle ID / package: `com.mariamtariq.replyly`
4. If stuck: `npx expo start -c`, reinstall Expo Go, confirm splash loads.

```bash
npm run typecheck
```

---

## 1) EAS CLI & project (already done)

```bash
npm install -g eas-cli   # optional; npx eas-cli works
eas login
cd replyly-mobile
eas init --force --non-interactive   # created @mariamtariq/replyly
```

`extra.eas.projectId` in `app.config.ts` is set to `f7976a6e-92d4-46b0-82fd-c2487ff958e5`.

Local `metro.config.js` isolates this app from the parent ShipNative NativeWind Metro config (required for EAS archive).

---

## 2) Apple Developer + App Store Connect

### Exact clicks for Mariam

1. Open https://developer.apple.com/programs/ → **Enroll** → pay **$99/year** → finish identity verification (can take 24–48h).
2. When active: [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list) → **Identifiers** → **+** → App IDs → App →  
   Bundle ID: **`com.mariamtariq.replyly`** → Register.
3. Open [App Store Connect](https://appstoreconnect.apple.com/) → **My Apps** → **+** → New App  
   - Name: Replyly  
   - Bundle ID: `com.mariamtariq.replyly`  
   - SKU: e.g. `replyly-ios`
4. Copy the numeric **Apple ID** (App information) into `eas.json` → `submit.production.ios.ascAppId`.
5. Privacy Policy URL: `https://replyly-kappa.vercel.app/privacy`
6. Age rating, category (Business / Productivity), screenshots (§8).

### 2b) iOS EAS credentials (required before iOS build works)

Non-interactive iOS build failed with:

> Distribution Certificate is not validated for non-interactive builds.  
> Credentials are not set up. Run this command again in interactive mode.

**Do this once on your machine (needs Apple Developer account):**

```bash
cd replyly-mobile
npx eas-cli build --platform ios --profile production
```

When prompted:

1. Log in with your **Apple ID** (the one enrolled in the Apple Developer Program).
2. Allow Expo to manage credentials / create Distribution Certificate + Provisioning Profile for `com.mariamtariq.replyly`.
3. If asked for a 2FA/app-specific password, create one at https://appleid.apple.com → Sign-In and Security → App-Specific Passwords.
4. Wait for the build URL (same dashboard as Android).

Or set credentials in the UI: https://expo.dev/accounts/mariamtariq/projects/replyly/credentials → iOS → set up Distribution Certificate + Provisioning Profile, then re-run the non-interactive build.

---

## 3) Google Play Console — exact clicks

1. Open https://play.google.com/console/signup → pay **$25** one-time → complete identity.
2. **Create app** → name **Replyly** → App → Free (or Paid).
3. Package name must be **`com.mariamtariq.replyly`** (already in `app.config.ts` — cannot change later).
4. Complete **Data safety** (on-device storage; optional notifications; no account system).
5. Privacy policy: `https://replyly-kappa.vercel.app/privacy`
6. When Android EAS build finishes → download **AAB** from the Expo build page → Play Console → **Production** or **Internal testing** → Create release → upload AAB.

---

## 4) Production builds (EAS)

```bash
cd replyly-mobile

# Android App Bundle (Play) — already queued once credentials existed
npx eas-cli build --platform android --profile production --non-interactive

# iOS IPA — run INTERACTIVE after Apple enrollment (§2b)
npx eas-cli build --platform ios --profile production
```

Preview APK for testers:

```bash
npx eas-cli build --platform android --profile preview
```

---

## 5) Submit to stores

```bash
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

Or download the artifact from the Expo dashboard and upload manually in Play Console / Transporter.

**Note:** Current Pro unlock uses Gumroad + code `REPLYLY-PRO` in AsyncStorage. Native IAP can be added later; declare digital goods correctly if you switch.

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

1. **Wrong entry** — `package.json` → `"main": "expo-router/entry"`.
2. **Stale cache** — `npx expo start -c`.
3. **Parent Metro bleed** — this app has its own `metro.config.js` (do not delete).
4. **Native mismatch** — after plugins change, rebuild with EAS.
5. **Splash stuck** — wait until `ReplylyProvider` is ready.
6. **Bundle ID typo** — must match Apple, Google, and `app.config.ts`.

---

## 8) Screenshots & listing copy

| Slot | Suggested frame |
|------|-----------------|
| 1 — Hero | Generate tab with 3 reply cards + green CTA |
| 2 — Intents | Quick intents + Arabic toggle |
| 3 — Profile | Business profile filled |
| 4 — Team | Invite code visible |
| 5 — Pro / Stats | Paywall or weekly stats |

- **Subtitle:** WhatsApp replies for small businesses  
- **Description:** Paste a customer message, get 3 on-brand replies. Profile, team invite codes, history, pinned templates. Free 5/day. Pro $12/mo.

---

## 9) What’s left for Mariam (checklist)

- [x] Expo login (`mariamtariq`)
- [x] EAS project + `projectId` committed
- [x] Android production build **queued** (watch dashboard until green)
- [ ] Apple Developer Program enrollment (**$99**)
- [ ] Interactive iOS credentials + `eas build --platform ios --profile production`
- [ ] Google Play Console enrollment (**$25**)
- [ ] Screenshots + store listing text
- [ ] Upload AAB to Play / IPA to App Store Connect (`eas submit` or manual)
- [ ] Put App Store Connect app id into `eas.json` → `ascAppId`
- [ ] (Optional later) Replace Gumroad unlock with native IAP  

Until iOS credentials exist, ship web PWA + Expo Go / Android EAS artifact.
