# Inventory Management API

## Local setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Set the Supabase PostgreSQL URL and a strong JWT secret in `.env` before starting the API. The health endpoint is available at `GET /health`.

## Migrations

From `backend/` with the virtual environment active:

```powershell
alembic upgrade head
```
