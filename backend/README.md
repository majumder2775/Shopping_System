# Aura Atelier: Backend (Express + Mongoose + MongoDB Atlas)

## Atlas setup (once)
1. Create a free **M0** cluster. 2. **Database Access**: add a DB user. 3. **Network Access**: add your IP.
4. **Connect > Drivers**: copy the `mongodb+srv://...` string; put the DB name (e.g. `aura_atelier`) before the `?`.

## Run
```bash
npm install
cp .env.example .env      # fill MONGODB_URI and JWT_SECRET
npm run dev               # API on http://localhost:5000
```
An empty database is auto-seeded on first start. `npm run seed` wipes and re-seeds.
Demo logins (password `Shop@1234`): `alex@atelier.in`, `rohan@atelier.in` (customers), `admin@atelier.in` (admin).

## Env vars
`MONGODB_URI`, `JWT_SECRET` (16+ chars), `PORT` (5000), `CLIENT_ORIGIN` (frontend URL(s), comma separated, for CORS),
`ALLOW_DEMO_LOGIN` ("true" enables the header's Customer/Admin switch; keep "false" in real deployments).

## Endpoints
Auth: `POST /api/auth/register|login`, `GET /api/auth/me`
Products: `GET /api/products[?category&search&minPrice&maxPrice&rating&inStockOnly&sort]`, `GET /api/products/:id`, `POST /api/products/:id/reviews`; admin: `POST|PUT|DELETE /api/products`
Inventory (admin): `PUT /api/inventory/:id`, `POST /api/inventory/batch-restock`
Orders: `GET|POST /api/orders`, `PUT /api/orders/:id/status`
Users: `PUT /api/users/me`, `POST|DELETE /api/users/me/addresses`; admin: `GET /api/users`, `PUT /api/users/:id/status`
Admin: `GET /api/audit-logs`, `GET /api/emails`, `GET /api/reports/sales`, `POST /api/admin/reset`

Orders run in a MongoDB transaction (Atlas replica set). Prices/tax/shipping/promos are recomputed server-side. Product image paths in the seed (`/images/...`) are served by the frontend.
