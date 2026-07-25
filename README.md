# Inventory Management System

A full-stack inventory application with a React/Vite frontend and FastAPI/PostgreSQL backend.

## Quick start

1. Configure the backend environment:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```

   Set the Supabase PostgreSQL `DATABASE_URL` and a strong `JWT_SECRET_KEY` in `backend/.env`.

2. Apply migrations and start the API:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

3. Configure and start the frontend in another terminal:

   ```powershell
   cd frontend
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```

The frontend runs at `http://localhost:5173` and connects to `http://localhost:8000/api/v1` by default.

## API integration tests

The end-to-end API suite uses a temporary SQLite database and does not connect to Supabase:

```powershell
python -m venv backend/.venv
backend\.venv\Scripts\python -m pip install -r backend/requirements.txt pytest httpx
$env:PYTHONPATH = (Resolve-Path backend).Path
backend\.venv\Scripts\python -m pytest tests/test_api_integration.py -q
```

## Integration

- The frontend sends `Authorization: Bearer <JWT>` automatically when a session is present.
- A `401` response clears the local session and redirects protected views to sign-in.
- Product mutations refresh the product list and notify the dashboard to reload its statistics and tables.

See [deployment documentation](docs/deployment.md) for production environment settings and deployment guidance.

credentials with Added Data:
Email: Qwerty@mail.com
Password: Qwerty@mail.com1
