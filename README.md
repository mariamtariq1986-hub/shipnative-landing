# ShipNative

A production-ready React Native Expo starter kit for shipping AI-powered mobile apps faster. ShipNative includes auth, theming, an AI assistant, and **monetization-ready** RevenueCat IAP — wired with conventions that keep Cursor (and other AI coding agents) productive without breaking your architecture.

**Features**

- **Expo Router** — file-based routing with typed routes (Expo SDK 57)
- **NativeWind v4** — Tailwind CSS 3.4 styling via `className`
- **Supabase auth** — email/password with secure session storage
- **Google Gemini AI** — streaming chat via REST (`lib/ai.ts`)
- **RevenueCat IAP** — real store purchases via `react-native-purchases`, with demo fallback when keys are missing
- **Paywall UI** — monthly/annual toggle, restore, premium entitlement state
- **Light & dark theme** — system-aware slate + teal palette
- **TypeScript** — strict mode throughout

---

## Quick Start Guide

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (comes with Node)
- Optional: [Expo Go](https://expo.dev/go) on a physical device, or an iOS Simulator / Android emulator

### Setup (3 steps)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Open `.env` and replace the placeholders with your Supabase and Gemini keys (see [Environment Setup](#environment-setup)). You can also leave the placeholders and run in [demo mode](#troubleshooting--demo-mode).

3. **Start the app**

   ```bash
   npx expo start
   ```

   Or use `npm start`. Scan the QR code with Expo Go, or press `i` / `a` / `w` for iOS, Android, or web.

**Useful scripts**

| Script | Command |
|--------|---------|
| Start Metro | `npm start` |
| Android | `npm run android` |
| iOS | `npm run ios` |
| Web | `npm run web` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |

---

## Architecture Breakdown

ShipNative follows a clear separation: routes in `app/`, providers in `context/`, integrations in `lib/`, and shared UI in `components/`.

### Folder structure

```
app/
  _layout.tsx          # Root Stack + Auth + Theme + Premium providers
  index.tsx            # Auth redirect gate (session → tabs / login)
  (auth)/
    _layout.tsx        # Public auth group guard
    login.tsx
    register.tsx
  (tabs)/
    _layout.tsx        # Bottom tabs: Dashboard / AI Assistant / Paywall
    index.tsx          # Dashboard
    ai-assistant.tsx   # Streaming Gemini chat
    paywall.tsx        # RevenueCat / demo paywall

context/
  AuthContext.tsx      # useAuth() — Supabase or demo session
  ThemeContext.tsx     # useTheme() — light / dark / system
  PremiumContext.tsx   # usePremium() — RevenueCat or demo entitlement

lib/
  supabase.ts          # Supabase client + isSupabaseConfigured
  ai.ts                # streamChatCompletion + Gemini / demo streaming
  purchases.ts         # RevenueCat init, offerings, purchase, restore

components/
  ui/                  # Button, TextField, Screen, etc.

types/
  env.d.ts             # Typed EXPO_PUBLIC_* env vars
```

### Key conventions

| Concern | Source of truth |
|---------|-----------------|
| Auth | `useAuth()` from `context/AuthContext.tsx` |
| Theme | `useTheme()` from `context/ThemeContext.tsx` |
| Premium / IAP | `usePremium()` from `context/PremiumContext.tsx` (RevenueCat via `lib/purchases.ts`) |
| AI calls | `streamChatCompletion` in `lib/ai.ts` (do not call Gemini URLs from screens) |
| Supabase client | `lib/supabase.ts` only |
| Entry | `expo-router/entry` (no `App.tsx`) |

### Other project files

| File | Role |
|------|------|
| `.cursorrules` | Agent rules + boilerplate prompts for Cursor |
| `global.css` | NativeWind / Tailwind entry (imported from `app/_layout.tsx` only) |
| `tailwind.config.js` | Palette tokens (`slateink-*`, `brand-*`) |
| `metro.config.js` | Metro bundler + NativeWind |
| `babel.config.js` | Babel presets / NativeWind |
| `app.json` | Expo config (typed routes enabled) |
| `.env.example` | Env variable template for buyers |

---

## Environment Setup

Copy `.env.example` to `.env`. Expo exposes only variables prefixed with `EXPO_PUBLIC_`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your-revenuecat-ios-api-key
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=your-revenuecat-android-api-key
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium
```

### Supabase (auth)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **Project Settings → API**.
3. Copy the **Project URL** into `EXPO_PUBLIC_SUPABASE_URL`.
4. Copy the **anon / public** key into `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
5. Enable **Email** auth under **Authentication → Providers** if it is not already on.

Leave the placeholder values (or omit real keys) to use **demo auth** — no Supabase project required for UI work.

### Google Gemini (AI Assistant)

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Set `EXPO_PUBLIC_GEMINI_API_KEY` in `.env`.

The kit calls Gemini `gemini-2.0-flash` through `lib/ai.ts` (`streamChatCompletion`). Without a real key, the assistant streams a local demo reply so you can still build and theme the chat UI.

### RevenueCat (in-app purchases)

ShipNative’s paywall is **monetization-ready** for the apps *you* ship (subscriptions inside your product). Buying the ShipNative kit itself is on Gumroad — IAP is for your end users.

1. Create a project at [RevenueCat](https://www.revenuecat.com/).
2. Add your **iOS** and **Android** apps (bundle id / package must match `app.json`).
3. Create an **entitlement** (e.g. `premium`) and set `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID` to the same id.
4. Create App Store / Play subscription products (e.g. monthly + annual), then attach them in RevenueCat.
5. Create an **Offering** named `default` with **Monthly** and **Annual** packages linked to those products.
6. Copy the platform **API keys** (Public app-specific keys) into:
   - `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`
   - `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`

Without keys (or on web / when the native SDK cannot configure), the kit runs **demo IAP**: Upgrade / Restore simulate Premium via AsyncStorage and show a clear banner on the paywall.

#### Expo Go vs development builds

`react-native-purchases` needs **native modules**. Real App Store / Play purchases **do not work in Expo Go**.

Use a development build:

```bash
npx expo install expo-dev-client
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

Or build with [EAS Build](https://docs.expo.dev/develop/development-builds/introduction/). Sandbox / license-test accounts are still required for store testing.

### After editing `.env`

Restart the Expo process (`npx expo start`). Env vars are read at bundler start; a hot reload alone may not pick them up.

---

## How to Use `.cursorrules`

ShipNative ships with a detailed **`.cursorrules`** file at the project root. Cursor (and compatible AI coding agents) load these rules so generated code stays aligned with:

- Expo Router group structure (`(auth)`, `(tabs)`)
- NativeWind `className` styling (slateink + brand palette, light/dark)
- Auth via `useAuth()`, premium via `usePremium()`, AI via `lib/ai.ts`, Supabase via `lib/supabase.ts`
- Strict TypeScript and no stub “coming soon” screens

### Workflow

1. Open the project in Cursor.
2. Open `.cursorrules` and scroll to **Boilerplate prompts**.
3. Paste a prompt into Agent / Chat.
4. Review the diff — routes, NativeWind tokens, and providers should stay intact.

### Included boilerplate prompts

| Prompt | What it generates |
|--------|-------------------|
| **New authenticated settings sub-page** | `app/(tabs)/settings.tsx` with profile, theme toggle, sign out |
| **New AI tool page (summarizer)** | Summarizer screen using `streamChatCompletion` |
| **Auth-gated modal feature** | Modal feedback form registered on the root stack |
| **Paywall feature flag card** | Extra enterprise tier on the paywall |
| **Reusable empty state component** | `components/ui/EmptyState.tsx` for empty chat, etc. |
| **Supabase profile fetch hook** | `hooks/useProfile.ts` for dashboard header data |

Example (settings page — paste as-is from `.cursorrules`):

```
Create app/(tabs)/settings.tsx as a Settings screen using NativeWind (slateink + brand palette) and Lucide icons.
Include sections: Profile summary from useAuth(), theme toggle via useTheme(), Sign out button, and links row.
Register it in app/(tabs)/_layout.tsx as a fourth tab OR hide it from the tab bar and navigate from Dashboard.
Use TypeScript, no StyleSheet, no stubs. Keep Expo Router group structure intact.
```

These prompts are designed so you can scaffold sub-pages in under a minute without breaking Expo Router or NativeWind conventions.

---

## Marketing site (Vercel / Netlify)

Static landing lives in [`web/`](web/) so it never conflicts with Expo Router. Root [`vercel.json`](vercel.json) sets `outputDirectory` to `web` so Vercel serves the landing even if Root Directory is left at the repo root (avoids Expo-root `NOT_FOUND` 404s).

| Path | Use |
|------|-----|
| `web/index.html` | Deployable landing |
| `vercel.json` | Vercel: Other / no install / no build / output `web` |
| `landing.html` | Gumroad custom landing (permalink `orrtfl`) — keep in sync with `web/index.html` |
| `marketing/` | Cover / thumbnail artboards for the Gumroad listing |

**Deploy**

1. **Vercel:** Import the repo → leave **Root Directory** empty → Framework **Other**, empty Build/Install, Output **`web`** (or rely on root `vercel.json`) → Deploy. Redeploy after config changes.
2. **Netlify:** Import the repo (root `netlify.toml` publishes `web`) → Deploy. Or drag-and-drop the `web` folder.

Buy CTAs point to [https://mariamtariq72.gumroad.com/l/shipnative](https://mariamtariq72.gumroad.com/l/shipnative). Details: [`web/README.md`](web/README.md).

---

## Troubleshooting & Demo Mode

### Demo mode (no API keys)

ShipNative degrades gracefully when keys are missing or still set to `.env.example` placeholders.

**Demo auth** (`context/AuthContext.tsx`)

- Active when Supabase URL/anon key are unset or still placeholders (`isSupabaseConfigured` is false).
- Sign in or register with **any email** and a password of **at least 6 characters**.
- Session is stored locally in AsyncStorage (`demo-auth-session`) and survives reloads until you sign out.

**Demo AI** (`lib/ai.ts`)

- Active when `EXPO_PUBLIC_GEMINI_API_KEY` is missing or still `your-gemini-api-key`.
- `streamChatCompletion` streams a local demo message word-by-word so the AI Assistant UI works without Gemini.

**Demo IAP** (`lib/purchases.ts` + `context/PremiumContext.tsx`)

- Active when RevenueCat keys are missing/placeholders, on web, or when the native SDK fails to configure (including Expo Go without a successful configure).
- **Upgrade Now** sets a local Premium flag in AsyncStorage; **Restore** reads it back.
- Paywall shows: *Demo mode — add RevenueCat keys for real IAP*.

You can explore Dashboard, auth, theming, chat, and the paywall before connecting production services.

### Common issues

| Problem | Fix |
|---------|-----|
| Env vars not applying | Restart Expo after editing `.env` (`npx expo start`). Confirm names use the `EXPO_PUBLIC_` prefix. |
| Stale Metro / weird cache | Clear cache: `npx expo start -c` |
| Auth always demo | Replace placeholder Supabase URL/key; placeholders containing `your-project` or `your-supabase-anon-key` keep demo mode on. |
| AI always demo reply | Set a real `EXPO_PUBLIC_GEMINI_API_KEY` and restart Expo. |
| IAP always demo / purchases fail in Expo Go | Add RevenueCat keys **and** run a [development build](#expo-go-vs-development-builds) (`expo-dev-client` / `prebuild` / EAS). Store IAP cannot run in Expo Go. |
| Offering prices stay at $9.99 / $79.99 | Ensure RevenueCat offering `default` has Monthly + Annual packages attached to store products. |
| Premium purchase but app stays free | Confirm `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID` matches the entitlement id attached to your products. |
| Type errors after edits | Run `npm run typecheck`. |
| NativeWind classes not applying | Ensure `global.css` is imported only from `app/_layout.tsx`; restart with `-c` if styles look wrong. |
| Module resolution / path aliases | Project uses `@/` → project root (see `tsconfig.json`). Prefer `@/lib/...`, `@/context/...`, etc. |

### Need help extending the kit?

Use `.cursorrules` as the contract for agents, keep new authenticated screens under `app/(tabs)/` (or a guarded group), and keep third-party calls behind `lib/` so screens stay presentational.

---

Built for buyers who want a clean Expo + AI foundation — not a throwaway demo. Customize, connect your keys, and ship.
