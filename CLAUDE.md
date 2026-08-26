# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Eventful is an events-planning / photo-booth app, split into three independently-deployed projects sharing one Firebase backend:

- `mobile/` — React Native (Expo) app for iOS/Android. The primary product.
- `web/` — Next.js 15 (App Router) site: marketing account pages, admin stats dashboard, subscription API routes.
- `backend/` — Firebase Cloud Functions (two codebases) plus Firebase Hosting acting as an API gateway.

There is no shared root `package.json`; each of the three projects has its own dependencies and must be worked on from within its own directory (`cd mobile`, `cd web`, `cd backend/node`, etc).

## Commands

### Mobile (`mobile/`)

```bash
npx expo start           # start Metro dev server (npm run start)
npx expo run:ios         # build & run native iOS
npx expo run:android     # build & run native Android
npm run lint             # expo lint
npx eslint . --fix       # fix lint issues
npx prettier --write .   # format
npx expo-doctor          # validate Expo config/deps
npx jest                 # run tests
npx jest path/to/file.test.ts   # run a single test file
npx jest -t "test name"         # run tests matching a name
```

Before installing a native dependency or changing native config, run `expo prebuild`. Development builds (needed to test native modules like Firebase/RevenueCat on-device) are produced by `bash ./scripts/ios-dev-build.sh` / `bash ./scripts/android-dev-build.sh`. Version/build-number bumps and store uploads go through `bash ./scripts/upload.sh` — run only when merging to main, not per-commit.

End-to-end flows are defined as Maestro YAML specs in `mobile/tests/*.yaml`, run sequentially via `mobile/tests/run_tests.sh` (see `mobile/tests/TESTING.md` for the covered scenarios: auth, onboarding, events, invites, photo booth, etc). These exercise the real backend, not mocks.

Do not commit `.expo`, `.vscode`, `dist`, `builds`, `.env`, or `scripts/keys` (already gitignored).

### Web (`web/`)

```bash
npm run dev          # next dev on :3000
npm run dev:turbo    # next dev --turbopack
npm run dev:clean    # kill stale dev servers on 3000/3001, clear .next, restart
npm run build
npm run lint
```

No test runner is configured for `web/`.

### Backend (`backend/`)

Two Cloud Functions codebases deployed to the same Firebase project, plus a Hosting rewrite layer that fronts them:

```bash
cd backend
npm run deploy            # functions:node + functions:python + hosting
npm run deploy:node
npm run deploy:python
npm run deploy:hosting
./dev.sh                  # local IPython shell against PRODUCTION Firebase — real writes, be careful
```

Node functions (`backend/node/`):
```bash
cd backend/node
npm run lint        # runs automatically as a predeploy hook too
npm run serve        # firebase emulators:start --only functions
npm run shell         # firebase functions:shell
npm run logs
```

Python functions (`backend/python/`) use `firebase_functions`, runtime `python314`, and are currently a stub (`pyHello`) — endpoints are migrated over from Node one at a time (see "Migrating a route to Python" below).

There is no local Firebase emulator flow wired up for day-to-day iteration on Node functions beyond `npm run serve`; `./dev.sh` connects to **production** Firebase for interactive debugging.

## Architecture

### API gateway / migration pattern (important — read before touching backend routes)

Public clients call `api.eventfulapp.com/<path>`, never Cloud Functions URLs directly. `backend/firebase.json` `hosting.rewrites` maps each path to a specific function (`functionId` + `region`). Today all routes point at Node functions; Python functions are added one at a time and swapped in by only changing the rewrite's `functionId` — no client/app release is required. When adding a new HTTP endpoint, add both the function export and a corresponding hosting rewrite.

Node HTTP handlers are written as factories that take dependencies (admin, db, secrets) and return an Express-style handler, then are wired up in `backend/node/index.js`:
```js
exports.signUp = onRequest({ secrets: [...], cors: [...] }, createSignUpHandler({ admin, MJ_API_KEY, MJ_SECRET }));
```
Handler implementations live under `backend/node/src/functions/` (`httpHandlers.js`, `firestoreHandlers.js`, `scheduledHandlers.js`), with cross-cutting logic in `backend/node/src/services/` (email, notifications, photos, Algolia user search, user helpers) and `backend/node/src/utils/`. Firestore-triggered functions (e.g. `syncFollowers`, `sendFeedbackEmail`) and the `deleteOldPhotos` scheduled function follow the same factory pattern. Secrets are declared via `defineSecret` and passed explicitly into handler factories rather than read globally.

### Mobile app structure

Feature-first under `mobile/src/features/<feature>/{screens,components,hooks,...}` (e.g. `auth`, `events`, `photo-booth`, `calendar`, `contacts`, `invite`, `onboarding`, `profile`, `settings`). Cross-feature code lives in:
- `src/services/firebase/` — one file per domain (`firebaseAuth.ts`, `firebaseEventFunctions.ts`, `firebaseInviteFunctions.ts`, `firebaseStorage.ts`, `firebaseListeners.ts`, etc.) — all direct Firestore/Auth/Storage access should go through these, not ad hoc calls in components.
- `src/services/api/` — calls out to the backend HTTP gateway (`create.ts`, `get.ts`, `update.ts`, `delete.ts`, `constants.ts`).
- `src/store/` — Redux Toolkit (currently just `UserSlice.ts`).
- `src/providers/` — app-wide React context providers (auth/loading modals, notifications, payments/RevenueCat) composed in `AppProvider.tsx`.
- `src/config/` — third-party SDK config (Sentry, RevenueCat, social auth).

Path alias `@/*` → `src/*` (configured in both `tsconfig.json` and `babel.config.cts` via `module-resolver`). Import order is enforced by `@trivago/prettier-plugin-sort-imports` per the root `.prettierrc.json` (react → react-native → @react-navigation → @expo/expo → `@/*` → relative).

Native config (bundle IDs, permissions, plugins, fonts, Firebase config files) is centralized in `mobile/app.config.ts`, not `app.json`. Firebase is configured via `GoogleService-Info.plist` / `google-services.json` at the mobile root.

### Web app structure

Next.js App Router with route groups under `web/src/app/`:
- `(public)/(shell)` and `(public)/(headerless)` — public pages with/without the shared header layout.
- `(account)/` — authenticated account area (`account/`, `stats/` admin dashboard with `feedback`, `subscribers`, `users` sub-pages, `forgot-password/`, `verify-email/`).
- `api/` — route handlers (`download-image`, `subscriptions`).

Firebase Admin access is centralized in `src/lib/firebase-admin.ts`; subscription/RevenueCat logic in `src/lib/subscriptions.ts`. Client-side Firebase Functions calls go through `src/services/FirebaseFunctions.js`. `next.config.ts` defines permanent redirects that send several routes (`/features`, `/contact`, `/blog`, `/about`, etc.) out to the separate marketing site at `eventfulapp.com`, and legacy `/app` and `/home` paths into the current app routes — check there before adding new top-level routes to avoid collisions.

## Cross-cutting notes

- All three apps talk to the **same** Firebase project (`eventful-23690`); there's no per-app staging project, so backend changes affect mobile and web simultaneously. `./dev.sh`'s IPython shell hits production data directly.
- CORS/allowed origins for backend functions are restricted to `eventfulapp.com` (and `localhost:3000` for a couple of auth endpoints) — check `backend/firebase.json` and the relevant `onRequest`/`cors_origins` config when adding a new caller.
- `backend/.agents/skills/` contains Firebase-specific Claude skills (auth, Firestore, security rules, hosting, Crashlytics, Remote Config, Data Connect, App Hosting) — consult these for Firebase-specific implementation details before improvising.
