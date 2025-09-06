# AI Journaling Mobile (Expo)

This is the Expo React Native client mirroring the web app's APIs and structure.

- API base: `/api/v1` (use Expo dev proxy or set a full URL via env)
- Auth: same endpoints (`/auth/signup`, `/auth/login`, `/auth/logout`, `/auth/check`, `/auth/user`)
- Journals: list/create endpoints (`/journal`, `/journal/total-entries`, `/journal/total-monthly-entries`, `/journal-template`)

## Run

```bash
cd mobile
npm start
```

On first run, ensure the backend is reachable from the device:
- Dev: use `expo start --tunnel` or set `EXPO_PUBLIC_API_BASE` to your LAN IP like `http://192.168.x.x:3000/api/v1`.

## Configure Base URL

Set `EXPO_PUBLIC_API_BASE` in `mobile/.env` (create it) if not using relative proxy:

```
EXPO_PUBLIC_API_BASE=http://192.168.1.10:3000/api/v1
```

The mobile client reads this if you update `src/lib/api.ts` to use `process.env.EXPO_PUBLIC_API_BASE`.

