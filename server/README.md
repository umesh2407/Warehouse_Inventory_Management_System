# Warehouse Inventory API

Node.js + Express + MongoDB backend for the Warehouse Inventory Management System.

## Setup

```bash
cd server
npm install
cp .env.example .env
```

Update `.env` with your MongoDB URI and JWT secret.

## Run

```bash
# development
npm run dev

# production
npm start

# seed initial admin user
npm run seed

# tests (uses MONGO_URI with a separate warehouse_inventory_test_<pid> database)
npm test
```

Default seeded admin (from `.env`):

- Email: `admin@warehouse.local`
- Password: `Admin@12345`

## API prefix

All routes are under `/api/v1`.

Authenticate with:

```http
Authorization: Bearer <token>
```

## Main endpoints

| Area | Endpoints |
|------|-----------|
| Health | `GET /health` |
| Auth | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Users | Admin: `POST/GET/PATCH/DELETE /users` |
| Products | `GET/POST/PATCH/DELETE /products` |
| Warehouses | `GET/POST/PATCH/DELETE /warehouses` |
| Inventory | `GET /inventory`, `POST /inventory/add|remove|transfer`, `GET /inventory/low-stock` |
| Dashboard | `GET /dashboard/summary` |

## Roles

- `ADMIN` — full access, including product/warehouse/user management
- `WAREHOUSE_STAFF` — view catalog, manage stock operations

## Postman collection

Import [`postman/Warehouse_Inventory_API.postman_collection.json`](postman/Warehouse_Inventory_API.postman_collection.json) into Postman.

1. Confirm `baseUrl` is `http://localhost:5000/api/v1`
2. Run **Auth → Login** (saves JWT to `token` automatically)
3. Use the remaining folders for frontend integration testing
