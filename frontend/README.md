# Inventory Management Frontend

## Setup

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

`VITE_API_BASE_URL` should point at the API version root (for example, `http://localhost:8000/api/v1`).

## Structure

- `src/api` — Axios client and API modules
- `src/components` — reusable UI and layout components
- `src/context` — global client state
- `src/features` — domain-specific forms and validation
- `src/pages` and `src/routes` — screens and route protection
- `src/types` — shared TypeScript contracts
