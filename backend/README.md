# Backend (Express + Mongoose + MongoDB Atlas)

## Atlas setup (once)
1. Create a free **M0** cluster. 2. **Database Access**: add a DB user. 3. **Network Access**: add your IP.
4. **Connect > Drivers**: copy the `mongodb+srv://...` string; put the DB name (e.g. `aura_atelier`) before the `?`.

## Run
```bash
npm install
cp .env.example .env      # then fill in the values (see Env vars below)
npm run dev               # API on http://localhost:5000
```
An empty database is auto-seeded on first start. `npm run seed` wipes and re-seeds.
Demo logins (password `Shop@1234`): `alex@atelier.in`, `rohan@atelier.in` (customers), `admin@atelier.in` (admin).

## Env vars
Required:
- `MONGODB_URI`: Atlas connection string
- `JWT_SECRET`: 16+ random characters
- `PORT`: default `5000`
- `CLIENT_ORIGIN`: frontend URL(s), comma separated, for CORS
- `ALLOW_DEMO_LOGIN`: `"true"` enables the header's Customer/Admin switch; keep `"false"` in real deployments

Optional features:
- `GOOGLE_CLIENT_ID`: enables Google sign-in (use the same Web client ID as the frontend's `VITE_GOOGLE_CLIENT_ID`). Without it, `POST /api/auth/google` returns 503.
- `GOOGLE_CLIENT_SECRET`, `GMAIL_USER`, `GMAIL_REFRESH_TOKEN`: send real order emails through Gmail. If any is missing, emails are only stored in the in-app inbox.

Never commit `.env`. Only `.env.example` (placeholders) is tracked.

## Google sign-in setup
1. Google Cloud Console > **APIs & Services > Credentials** > create an **OAuth client ID** of type **Web application**.
2. Add `http://localhost:3000` under **Authorized JavaScript origins** (add your deployed URL too when you deploy).
3. On the OAuth consent screen, add your Gmail under **Test users** while the app is in Testing mode.
4. Put the client ID in `GOOGLE_CLIENT_ID` (backend `.env`) and `VITE_GOOGLE_CLIENT_ID` (frontend `.env`), then restart both servers.

The backend verifies the Google ID token server-side, then links to an existing account with the same email or creates a new customer account.

## Endpoints
Auth: `POST /api/auth/register|login|google`, `GET /api/auth/me`
Upload (admin): `POST /api/upload` (images saved to `uploads/`, served at `/uploads/...`)
Products: `GET /api/products[?category&search&minPrice&maxPrice&rating&inStockOnly&sort]`, `GET /api/products/:id`, `POST /api/products/:id/reviews`; admin: `POST|PUT|DELETE /api/products`
Inventory (admin): `PUT /api/inventory/:id`, `POST /api/inventory/batch-restock`
Orders: `GET|POST /api/orders`, `PUT /api/orders/:id/status`
Users: `PUT /api/users/me`, `POST|DELETE /api/users/me/addresses`; admin: `GET /api/users`, `PUT /api/users/:id/status`
Admin: `GET /api/audit-logs`, `GET /api/emails`, `GET /api/reports/sales`, `POST /api/admin/reset`

Orders run in a MongoDB transaction (Atlas replica set). Prices/tax/shipping/promos are recomputed server-side. Product image paths in the seed (`/images/...`) are served by the frontend.
