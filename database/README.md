# Database migrations

From `backend/`, copy `.env.example` to `.env`, configure `DATABASE_URL`, then run:

```powershell
alembic revision --autogenerate -m "create inventory schema"
alembic upgrade head
```

Migrations derive their metadata from `backend/app/models` and are written to `database/migrations/versions`.
