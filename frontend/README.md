# Aura Atelier: Frontend (React + Vite)

Needs the backend running (see the `backend` project). Default API: `http://localhost:5000`.

```bash
npm install
npm run dev            # http://localhost:3000, proxies /api -> localhost:5000
```

Deploying the frontend separately from the API? Set `VITE_API_URL` (e.g. `https://your-api.example.com/api`) before `npm run build`,
and add this site's URL to `CLIENT_ORIGIN` in the backend `.env`.

Demo logins (password `Shop@1234`): `alex@atelier.in`, `rohan@atelier.in`, `admin@atelier.in`.
The header's Customer/Admin switch needs `ALLOW_DEMO_LOGIN="true"` on the backend.
