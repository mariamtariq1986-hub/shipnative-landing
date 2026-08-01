# Expo AI App Setup Checklist

**ShipNative** free lead magnet · optional credit: buildsby_mariam

A practical gate list for shipping a React Native Expo app with auth, theming, streaming AI chat, and a paywall — without rediscovering the same pitfalls every weekend.

- **Time:** ~45–90 min to walk once
- **Stack:** Expo SDK 57 · Expo Router · NativeWind · Supabase · Gemini · RevenueCat
- **No signup.** Bookmark or print this page. Soft CTA at the end if you want the wired kit.

Live HTML (printable / Save as PDF): https://shipnative-landing.vercel.app/lead-magnet.html

---

## 1. Expo Router & auth gates

File-based routes are easy; session redirects are where apps feel broken. Lock this before polishing UI.

- [ ] Use Expo Router groups: `(auth)` for login/register, `(tabs)` for authenticated shell. Keep `app/index.tsx` as a redirect gate — not a marketing page inside the app.
- [ ] Unauthenticated users hitting tabs redirect to login; authenticated users hitting auth screens redirect into tabs. Guard in layout files so every nested screen inherits the rule.
- [ ] Enable typed routes (`experiments.typedRoutes`) and use typed `Href` / `router.push` paths.
- [ ] Bottom tabs cover the money path: Dashboard → AI Assistant → Paywall/Settings. Don’t bury the paywall three menus deep if you plan to monetize.
- [ ] Confirm cold start: kill app → reopen → session still routes correctly (Secure Store / session restore).

**Trap:** Putting auth logic only on the login screen. Layout-level redirects catch deep links and tab restores.

---

## 2. NativeWind & theme

Ship one palette and light/dark early so every new screen doesn’t invent hex values.

- [ ] NativeWind v4 + Tailwind configured; style with `className` (avoid `StyleSheet.create` unless a library requires it).
- [ ] Import `global.css` once from the root layout — not per screen.
- [ ] Define brand tokens in `tailwind.config.js` (e.g. deep slate + teal accent) and use them everywhere.
- [ ] Theme toggle works on first paint (persist preference; respect system until user chooses). Check login, chat bubbles, and paywall cards in both modes.
- [ ] Touch targets ≥ 44px; contrast holds on muted body text over elevated surfaces.

---

## 3. Supabase auth

Auth is not “a form.” It’s session persistence, error copy, and a path that works before keys exist.

- [ ] Single Supabase client module (`lib/supabase.ts`); screens never construct their own client.
- [ ] Auth state lives in a provider/context (`useAuth()`) — login, register, sign-out, session.
- [ ] Session persisted with Expo Secure Store (or equivalent) so iOS/Android restarts keep the user in.
- [ ] Email/password flows show human errors (invalid credentials, weak password, network) — not raw SDK dumps.
- [ ] Supabase dashboard: email auth enabled; redirect URLs set if you add magic links / OAuth later.
- [ ] Sign-out clears session and lands on login without a white flash or stuck spinner.

**Tip:** Keep anon key in `EXPO_PUBLIC_*` only. Never ship the service role key in the mobile app.

---

## 4. Gemini / AI chat

Isolate the API client so screens stay presentational and you can swap models later.

- [ ] All Gemini calls go through one module (e.g. `lib/ai.ts`) — no fetch URLs hard-coded in screens.
- [ ] Chat UI supports user/assistant bubbles, empty state, and a clear “thinking / streaming” state.
- [ ] Streaming (or progressive updates) works; abort/cancel doesn’t leave a half-dead message stuck forever.
- [ ] Missing/invalid API key fails gracefully with actionable copy (“add `EXPO_PUBLIC_GEMINI_API_KEY`”).
- [ ] Rate-limit / 429 / network errors surface a retry path — don’t silently swallow.
- [ ] Prompt suggestions or a starter prompt exist so the first open doesn’t feel empty.

**Security note:** Client-side Gemini keys are fine for demos/MVPs. For production traffic, prefer a thin backend proxy when abuse becomes real.

---

## 5. RevenueCat / IAP paywall

Store purchases need a development build — Expo Go will not exercise real IAP. Design for that from day one.

- [ ] Premium state exposed via one hook/context (`usePremium()`), not scattered `AsyncStorage` flags.
- [ ] Paywall UI: at least monthly + annual, selected state, feature checklist, restore purchases.
- [ ] RevenueCat products + entitlement ID match env (`EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`, default often `premium`).
- [ ] Separate iOS / Android API keys; configure only on native (skip web / Expo Go cleanly).
- [ ] Gated feature(s) check premium before running (e.g. unlimited AI) and route to paywall when locked.
- [ ] Test on a **development build** / TestFlight / internal testing — not Expo Go — before App Store submit.

---

## 6. Environment variables

Wrong env is the #1 “it works on my machine” for Expo teams. Treat placeholders as first-class.

- [ ] Copy `.env.example` → `.env`; never commit real secrets.
- [ ] Only `EXPO_PUBLIC_*` vars are read in the app; types declared (e.g. `types/env.d.ts`).
- [ ] Required keys documented: `EXPO_PUBLIC_SUPABASE_URL` · `EXPO_PUBLIC_SUPABASE_ANON_KEY` · `EXPO_PUBLIC_GEMINI_API_KEY` · `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` · `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` · optional entitlement ID.
- [ ] Placeholder detection: treat values like `your-*-api-key` as “not configured,” not as real keys.
- [ ] After changing `.env`, restart Metro with a clean cache when values don’t stick.

---

## 7. Demo mode (ship before keys)

Buyers and teammates should click around before wiring dashboards. Demo mode is a product feature.

- [ ] Auth works without Supabase keys (local/demo session) with clear UI labeling that it’s demo.
- [ ] AI chat returns a scripted/streamed demo reply when Gemini isn’t configured — not a crash.
- [ ] Paywall upgrade/restore simulates premium in demo mode; messaging explains real IAP needs a dev build + RevenueCat keys.
- [ ] Switching from demo → real keys doesn’t leave stale “fake premium” or orphan sessions.

**Why this matters:** Demo mode turns your repo into a live demo for sales pages and Gumroad previews — not a wall of setup instructions.

---

## 8. Ship checklist (before you call it done)

The last mile is boring. That’s why it ships late if you don’t list it.

- [ ] `npm run typecheck` (or `tsc --noEmit`) is clean.
- [ ] Smoke path on device: register/login → chat once → open paywall → restore → sign out → sign in.
- [ ] App icons, splash, `app.json` name/slug/bundle IDs set for the product you’re shipping (not the starter defaults).
- [ ] Privacy policy + terms linked from settings/paywall if you collect auth or process payments.
- [ ] EAS / store listing: screenshots for both platforms; IAP products approved in App Store Connect / Play Console.
- [ ] Kill placeholder copy (“Your App”, lorem, TODO) in user-visible strings.
- [ ] Decide production AI path: keep client key for low traffic, or move to a proxy before launch marketing spikes.

---

## Want this already wired?

**ShipNative** is the production-ready Expo AI starter with Supabase Auth, NativeWind, streaming Gemini chat, and a RevenueCat paywall — demo mode included — so your first commit can be a real feature.

- Full kit (one-time $40): https://mariamtariq72.gumroad.com/l/shipnative
- Landing: https://shipnative-landing.vercel.app
- Free checklist (HTML): https://shipnative-landing.vercel.app/lead-magnet.html
