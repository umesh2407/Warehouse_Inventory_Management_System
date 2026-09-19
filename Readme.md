# Warehouse Inventory Management System

A role-based warehouse inventory app for managing products, warehouses, and stock. Admins own the catalog and users; warehouse staff view the catalog and perform stock operations. Inventory stays consistent across warehouses with validation, transfers, and low-stock alerts.

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite, Redux Toolkit, Axios, Tailwind CSS, React Router |
| Backend | Node.js, Express, Mongoose, JWT, Zod |
| Database | MongoDB |
| Tests | Jest + Supertest (API), Vitest (client) |

---

## Setup instructions

### Prerequisites

- Node.js 18 or later
- npm
- A MongoDB database (local or Atlas)

The seed script only creates the **admin** user. Warehouse staff accounts are created from the Users page after you log in as admin.

### 1. Clone and install

```bash
git clone <repository-url>
cd Warehouse_system
```

Backend:

```bash
cd server
npm install
```

Frontend (new terminal):

```bash
cd client
npm install
```

### 2. Configure environment variables

Create `server/.env` (do not commit this file):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/warehouse_inventory
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@warehouse.local
ADMIN_PASSWORD=Admin@12345
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

`MONGO_URI` and `JWT_SECRET` are required to start the API. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are required only for `npm run seed`.

### 3. Seed the admin user

```bash
cd server
npm run seed
```

If the admin already exists, the seed prints `Admin already exists` and exits without changing the password.

Existing databases that predate user soft-delete can be backfilled with:

```bash
cd server
npm run migrate:users-soft-delete
```

### 4. Run the app

Terminal 1 — API (http://localhost:5000):

```bash
cd server
npm run dev
```

Health check: `GET http://localhost:5000/api/v1/health`

Terminal 2 — UI (http://localhost:5173):

```bash
cd client
npm run dev
```

Open http://localhost:5173 and sign in with the credentials below.

### Tests

```bash
cd server
npm test
```

Server tests need `MONGO_URI` in `server/.env`. They use a separate database named `warehouse_inventory_test_<pid>` and clean collections after each test.

```bash
cd client
npm run test:run
```

### API testing (optional)

Import `server/postman/Warehouse_Inventory_API.postman_collection.json` into Postman.

1. Set `baseUrl` to `http://localhost:5000/api/v1`
2. Set `adminEmail` / `adminPassword` to the values in `server/.env`
3. Run **Auth → Login** (saves the JWT to `token`)
4. Use the remaining folders for products, warehouses, inventory, users, and dashboard

---

## Test login credentials

These match the seeded admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env`.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@warehouse.local` | `Admin@12345` |

There is **no seeded warehouse staff user**. After logging in as admin:

1. Open **Users**
2. Create a staff account (name, email, password; minimum 8 characters)
3. Log out and sign in as that staff user

Created users always receive the `WAREHOUSE_STAFF` role. The system allows only one admin (the seeded account).

Inactive or soft-deleted users cannot log in.

---

## Implemented features

### Authentication and access control

- Email/password login with bcrypt password hashing
- JWT session (`Authorization: Bearer <token>`), 7-day expiry by default
- Protected pages redirect unauthenticated users to `/login`
- Logout clears the client session and cookie
- Backend role checks on every mutating catalog/user route (frontend hiding is not the security boundary)

### Roles

| Capability | Admin | Warehouse Staff |
| --- | --- | --- |
| Login / logout / dashboard | Yes | Yes |
| View and search products | Yes | Yes |
| Create / update / delete products | Yes | No |
| View warehouses | Yes | Yes |
| Create / update / delete warehouses | Yes | No |
| View inventory, add / remove / transfer stock | Yes | Yes |
| View low-stock items | Yes | Yes |
| Manage users | Yes | No |

### Products (admin write, both roles read)

- CRUD with unique SKU, non-negative price and minimum stock
- Case-insensitive search by name or SKU (debounced on the client, filtered on the server)
- Pagination, empty/loading/error states, delete confirmation
- Soft delete; blocked if the product still has stock

### Warehouses (admin write, both roles read)

- CRUD with unique name, required location, non-negative capacity
- Capacity is a hard limit when adding or transferring stock
- Soft delete; blocked if the warehouse still has stock

### Inventory (both roles)

- Stock listed by product and warehouse, with search and product/warehouse filters
- Add, remove, and transfer stock
- Quantity must be a positive integer
- Cannot remove or transfer more than available stock (atomic `$inc` with `quantity >= n`)
- Source and destination warehouses must differ
- Transfers use a MongoDB transaction when the cluster supports it; otherwise a compensating rollback
- Low-stock when **total quantity across all warehouses** is below the product’s `minimumStockLevel`

### Dashboard

- Cards for total products, warehouses, stock quantity, and low-stock count
- Low-stock table with current vs minimum levels
- Quick links to catalog and inventory pages

### Users (admin only)

- Create warehouse staff accounts
- List, update name/email, activate/deactivate staff
- Soft-delete staff
- Cannot delete yourself, cannot delete the admin, cannot assign a second admin

### Frontend UX

- Responsive layout (desktop sidebar, mobile drawer)
- Light/dark theme
- Loading, empty, validation, and error states
- Toast feedback on successful mutations and API errors

---

## Assumptions

- SKU uniqueness is global (normalized to uppercase). Warehouse names are unique (case-insensitive).
- Inventory quantity lives only on inventory records, not as a mutable field on products.
- Low-stock is **product-wide** (sum of stock in every warehouse), not per warehouse.
- Warehouse `capacity` is a hard ceiling on total units in that warehouse, across all products.
- Products and warehouses with remaining stock cannot be deleted; zero-stock records can be soft-deleted.
- Soft-deleted rows stay in the database for history but are excluded from lists, search, and stock operations.
- Only one admin exists; extra users created in the UI are warehouse staff.
- JWT is the session. Logout clears the cookie/client token; tokens are not server-side blacklisted and expire on `JWT_EXPIRES_IN`.
- Auth uses the `Authorization` header. The client stores the token in a cookie for convenience; the API does not require an HTTP-only cookie.
- MongoDB Atlas (replica set) is preferred so transfers run in a transaction. Standalone MongoDB still works via the fallback path.
- Pagination defaults to 20 items per page (max 100).
- Automated API tests talk to a real MongoDB instance via `MONGO_URI`, not an in-memory substitute.

---

## Known limitations

- **No inventory audit log.** Add / remove / transfer history and “recent activity” on the dashboard are not stored.
- **No default staff login.** Reviewers must create a staff user as admin before testing the staff role.
- **JWT is not stored in an HTTP-only cookie.** The token is readable by JavaScript, so XSS could steal it. Use HTTPS and keep dependencies updated in production.
- **Logout does not revoke tokens.** A copied token remains valid until it expires.
- **No password reset, self-registration, or email verification.** Admins create staff accounts.
- **No rate limiting** on login.
- **Frontend tests are unit-level** (auth slice, cookies, errors). Full page/E2E coverage is not included.
- **Product/warehouse dropdowns** on the inventory page load the first 100 catalog items.
- **Zero-quantity inventory rows** can remain after stock is fully removed; they are not auto-purged.
- **Production deploy** (hosting, HTTPS, CI) is not part of this repo. Run locally with the steps above.

---

## Project layout

```text
Warehouse_system/
├── client/          React + Vite UI
├── server/          Express API
│   ├── src/modules  auth, users, products, warehouses, inventory, dashboard
│   ├── tests/       API integration tests
│   └── postman/     Postman collection
└── warehouse_inventory_requirements.md
```

All REST routes are under `/api/v1`. See `server/README.md` for the endpoint list.
