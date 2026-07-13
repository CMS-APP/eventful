<!-- @format -->

# Backend (Cloud Functions)

Two codebases in the same Firebase project:

- `node/` — **production** HTTP + Firestore + scheduled functions
- `python/` — stub (`pyHello`); migrate handlers here one at a time
- `hosting/` — API gateway for `api.eventfulapp.com` (rewrites → Cloud Functions)

## API gateway (`api.eventfulapp.com`)

Firebase Hosting rewrites map clean paths to **Node** functions today:

| Path | Function |
|------|----------|
| `/respondToEvent` | `respondToEvent` |
| `/appCheckToken` | `appCheckToken` |
| `/sendVerificationEmail` | `sendVerificationEmail` |
| `/forgotPassword` | `forgotPassword` |
| `/signUp` | `signUp` |
| `/incrementUserCount` | `incrementUserCount` |
| `/incrementEventCount` | `incrementEventCount` |
| `/searchUsers` | `searchUsers` |

Example: `https://api.eventfulapp.com/searchUsers`

### Migrating a route to Python

1. Deploy a Python function (e.g. `pySearchUsers`) with the same HTTP contract.
2. In `firebase.json`, change that path’s rewrite `functionId` from `searchUsers` to `pySearchUsers`.
3. `npm run deploy:hosting` (and deploy the Python function).
4. Clients keep the same `api.eventfulapp.com/...` URL — no app release required.

## Local IPython (production Firebase)

```bash
cd backend
./dev.sh
```

## Deploy

```bash
cd backend

# Node + Python + Hosting rewrites
npm run deploy

# Or individually
npm run deploy:node
npm run deploy:python
npm run deploy:hosting
```
