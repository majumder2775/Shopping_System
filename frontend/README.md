# Frontend (React + Vite)

Needs the backend running (see the `backend` folder). Default API: `http://localhost:5000`.

```bash
npm install
cp .env.example .env     # then set VITE_GOOGLE_CLIENT_ID (optional)
npm run dev              # http://localhost:3000, proxies /api -> localhost:5000
```

## Env vars
- `VITE_API_URL`: only needed when the API is hosted separately (e.g. `https://your-api.example.com/api`). Set it before `npm run build`, and add this site's URL to `CLIENT_ORIGIN` in the backend `.env`.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Web client ID. Enables the "Sign in with Google" button; without it the button is hidden. Vite reads `.env` only at startup, so restart `npm run dev` after changing it.

Google setup: add `http://localhost:3000` under **Authorized JavaScript origins** for the client (see the backend README). Use `localhost:3000` in the browser, since `127.0.0.1` is a different origin.

## Demo logins
Password `Shop@1234`: `alex@atelier.in`, `rohan@atelier.in` (customers), `admin@atelier.in` (admin).
The header's Customer/Admin switch needs `ALLOW_DEMO_LOGIN="true"` on the backend.

## Build
```bash
npm run build     # output in dist/
```
