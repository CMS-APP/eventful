# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Eventful is an events-planning / photo-booth app, split into three independently-deployed projects sharing one Firebase backend:

- `mobile/` — React Native (Expo) app for iOS/Android. The primary product.
- `web/` — Next.js 15 (App Router) site: marketing account pages, admin stats dashboard, subscription API routes.
- `backend/` — Firebase Cloud Functions (two codebases) plus Firebase Hosting acting as an API gateway.

There is no shared root `package.json`; each of the three projects has its own dependencies and must be worked on from within its own directory (`cd mobile`, `cd web`, `cd backend/node`, etc).

## Commands

### Running everything locally

```bash
./run_server.sh               # backend emulator (:5050) + web (:3000) in background, Metro in foreground
./run_server.sh --no-mobile   # backend + web only
```

Dev builds of mobile and web call the backend at `http://localhost:5050` (`mobile/src/services/firebase/backend.ts`, `web/src/lib/backendUrl.ts`), so backend calls fail unless the emulator (`backend/emulate.sh`) is running. The emulator runs functions locally against **production** Firestore/Auth. Background logs go to `.dev-logs/`, and Ctrl+C stops everything.

### Mobile (`mobile/`)

```bash
npx expo start           # start Metro dev server (npm run start)
npx expo run:ios         # build & run native iOS
npx expo run:android     # build & run native Android
npm run lint             # expo lint
npx eslint . --fix       # fix lint issues
npx prettier --write .   # format
npx expo-doctor          # validate Expo config/deps
```

Before installing a native dependency or changing native config, run `expo prebuild`. All build/deploy flows go through `bash ./scripts/build.sh` (interactive menu, or pass args). Development builds (needed to test native modules like Firebase/RevenueCat on-device) are produced by `bash ./scripts/build.sh dev ios|android|both` (output to `build/dev/`), or `bash ./scripts/build.sh sim ios|android` to build and launch on a simulator with Metro attached. iOS `buildNumber` and Android `versionCode` are kept identical. Version/build-number bumps and store uploads go through `bash ./scripts/build.sh deploy [ios|android|both]` — run only when merging to main, not per-commit.

There are no automated end-to-end tests for mobile; flows are tested manually on device.

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

Python functions (`backend/python/`) use `firebase_functions`, runtime `python314`. **All new backend functions go in Python, not Node** — the backend is migrating to Python, and `backend/node/` should only be touched to fix existing Node endpoints. Most HTTP, Firestore-triggered and scheduled functions already live here: `main.py` re-exports handlers from `src/functions/{http,firestore,scheduled}_handlers.py`, which delegate to plain functions in `src/services/<domain>.py`.

There is no local Firebase emulator flow wired up for day-to-day iteration on Node functions beyond `npm run serve`; `./dev.sh` connects to **production** Firebase for interactive debugging.

## Architecture

### API gateway / migration pattern (important — read before touching backend routes)

Public clients call `api.eventfulapp.com/<path>`, never Cloud Functions URLs directly. `backend/firebase.json` `hosting.rewrites` maps each path to a specific function (`functionId` + `region`). Rewrites don't care which codebase a function lives in, so a route moves from Node to Python just by changing the rewrite's `functionId`, with no client/app release required. When adding a new HTTP endpoint, write it in Python and add both the function export in `main.py` and a corresponding hosting rewrite. When migrating a handler, call `verify_app_check(req)` on the raw request before any `req = format_request(req)`-style reshaping, and verify the endpoint end-to-end afterwards, because lint won't catch runtime errors.

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
