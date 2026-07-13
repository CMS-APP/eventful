<!-- @format -->

# Backend (Cloud Functions)

Two codebases in the same Firebase project:

- `node/` — **production** endpoints
- `python/` — stub entry point (`pyHello`); migrate endpoints here one at a time

## Python stub

| URL | Function |
|-----|----------|
| `https://api.eventfulapp.com/hello` | `pyHello` |

## Local IPython (production Firebase)

```bash
cd backend
./dev.sh
```

## Deploy

```bash
# Node (production endpoints)
firebase deploy --only functions:node

# Python stub + Hosting rewrite
firebase deploy --only functions:python,hosting
```

If you previously deployed other `py*` functions (e.g. `pySignUp`) and no longer want them:

```bash
firebase functions:delete pySignUp --region us-central1
```

(Confirm each deletion when prompted.)
