# Deployment and integration guide

## Environment variables

### Backend

Configure these on the FastAPI host; do not commit them.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase PostgreSQL URL using the `postgresql+psycopg` driver. |
| `JWT_SECRET_KEY` | A random secret of at least 32 characters. |
| `JWT_ALGORITHM` | `HS256` unless intentionally changed. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access-token lifetime. |
| `BACKEND_CORS_ORIGINS` | Comma-separated allowed frontend origins, such as `https://inventory.example.com`. |
| `ENVIRONMENT` | `production` in deployed environments. |
| `DEBUG` | Set to `false` in production. |

### Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Public API version root, for example `https://api.example.com/api/v1`. |

Vite exposes only variables prefixed with `VITE_`; never put database or JWT secrets in frontend variables.

## Deployment sequence

1. Provision the Supabase database and set the backend `DATABASE_URL`.
2. Deploy the FastAPI service to Railway from the repository root. Set Railway's config file path to `/backend/railway.toml`; the committed config installs backend dependencies, runs Alembic before deployment, and starts the API health endpoint.
3. Run `alembic upgrade head` as part of the backend release process (the Railway configuration performs this automatically).
4. Set `BACKEND_CORS_ORIGINS` to the exact deployed frontend URL.
5. Deploy `frontend/` to Vercel, Netlify, or similar with build command `npm run build` and output directory `dist`.
6. Set `VITE_API_BASE_URL` to the public FastAPI `/api/v1` URL, then redeploy the frontend because Vite embeds environment values at build time.

## QA checklist

- Register a user, then verify it is redirected to the dashboard.
- Refresh the browser and verify the JWT session remains active.
- Verify a missing/expired token redirects protected pages to login.
- Create, edit, and delete a product; confirm the product table and dashboard totals refresh.
- Test low-stock filtering, mobile navigation, error states, and the 404 route.
- Verify CORS from the deployed frontend origin before release.
