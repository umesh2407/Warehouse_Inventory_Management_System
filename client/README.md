# Frontend

React (Vite) client for the Warehouse Inventory Management System.

## Setup

```bash
cd client
npm install
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points at the API (default `http://localhost:5000/api/v1`).

## Scripts

```bash
npm run dev        # start Vite
npm run build      # production build
npm run lint       # ESLint
npm run test       # Vitest watch
npm run test:run   # Vitest once
```

## Pre-commit (Husky)

On commit, Husky runs:

1. `lint-staged` (ESLint on staged JS/JSX)
2. `npm run test:run`
3. `npm run build`

## Stack

- Redux Toolkit + Axios
- Tailwind CSS (light / dark theme)
- React Router
- lucide-react icons
