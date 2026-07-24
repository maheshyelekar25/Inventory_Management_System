"""End-to-end API checks using a disposable SQLite database."""

import os

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://postgres:password@localhost:5432/inventory")
os.environ.setdefault("JWT_SECRET_KEY", "integration-test-secret-key-that-is-long-enough")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app as fastapi_app
import app.models  # noqa: F401 - register model metadata


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


def override_get_db():
    with Session(engine) as session:
        yield session


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_inventory_api_end_to_end() -> None:
    Base.metadata.create_all(engine)
    fastapi_app.dependency_overrides[get_db] = override_get_db
    client = TestClient(fastapi_app)
    try:
        assert client.get("/health").json() == {"status": "ok"}
        assert client.get("/api/v1/categories").status_code == 401

        invalid_registration = client.post("/api/v1/auth/register", json={"full_name": "A", "email": "bad", "password": "short"})
        assert invalid_registration.status_code == 422

        registration = client.post(
            "/api/v1/auth/register",
            json={"full_name": "Test Admin", "email": "admin@example.com", "password": "password123"},
        )
        assert registration.status_code == 201
        assert registration.json()["role"] == "admin"
        assert client.post("/api/v1/auth/register", json={"full_name": "Test Admin", "email": "admin@example.com", "password": "password123"}).status_code == 409
        assert client.post("/api/v1/auth/login", json={"email": "admin@example.com", "password": "wrong"}).status_code == 401

        login = client.post("/api/v1/auth/login", json={"email": "admin@example.com", "password": "password123"})
        assert login.status_code == 200
        token = login.json()["access_token"]
        headers = auth_header(token)
        assert client.get("/api/v1/auth/me", headers=headers).json()["email"] == "admin@example.com"

        invalid_category = client.post("/api/v1/categories", headers=headers, json={"name": "   "})
        assert invalid_category.status_code == 422
        category = client.post("/api/v1/categories", headers=headers, json={"name": "Electronics", "description": "Devices"})
        assert category.status_code == 201
        category_id = category.json()["id"]
        assert client.post("/api/v1/categories", headers=headers, json={"name": "Electronics"}).status_code == 409
        assert client.get("/api/v1/categories", headers=headers, params={"search": "lect"}).json()["total"] == 1
        assert client.patch(f"/api/v1/categories/{category_id}", headers=headers, json={"description": "Consumer devices"}).status_code == 200

        unknown_category_product = client.post(
            "/api/v1/products",
            headers=headers,
            json={"name": "Invalid", "sku": "INVALID", "category_id": "00000000-0000-0000-0000-000000000000", "price": 1, "quantity": 0},
        )
        assert unknown_category_product.status_code == 422
        product = client.post(
            "/api/v1/products",
            headers=headers,
            json={"name": "Wireless Mouse", "sku": "MOUSE-001", "category_id": category_id, "price": 999.5, "quantity": 2, "low_stock_threshold": 3},
        )
        assert product.status_code == 201
        product_id = product.json()["id"]
        assert client.post("/api/v1/products", headers=headers, json={"name": "Duplicate", "sku": "MOUSE-001", "category_id": category_id, "price": 1, "quantity": 0}).status_code == 409
        assert client.get("/api/v1/products", headers=headers, params={"search": "mouse"}).json()["total"] == 1
        assert client.get("/api/v1/products", headers=headers, params={"category_id": category_id}).json()["total"] == 1
        assert client.get("/api/v1/products", headers=headers, params={"low_stock": True}).json()["total"] == 1
        assert client.get("/api/v1/products", headers=headers, params={"low_stock": False}).json()["total"] == 0
        assert client.get("/api/v1/products", headers=headers, params={"min_price": 1000, "max_price": 1}).status_code == 422
        assert client.patch(f"/api/v1/products/{product_id}", headers=headers, json={"name": "Ergonomic Mouse", "price": 1099.5}).status_code == 200

        assert client.post(f"/api/v1/products/{product_id}/stock", headers=headers, json={"movement_type": "OUT", "quantity": 3}).status_code == 409
        stock_in = client.post(f"/api/v1/products/{product_id}/stock", headers=headers, json={"movement_type": "IN", "quantity": 5, "reason": "Restock"})
        assert stock_in.status_code == 201
        stock_out = client.post(f"/api/v1/products/{product_id}/stock", headers=headers, json={"movement_type": "OUT", "quantity": 4, "reason": "Sale"})
        assert stock_out.status_code == 201
        assert client.get(f"/api/v1/products/{product_id}", headers=headers).json()["quantity"] == 3

        dashboard = client.get("/api/v1/dashboard/statistics", headers=headers)
        assert dashboard.status_code == 200
        assert dashboard.json()["total_products"] == 1
        assert dashboard.json()["total_categories"] == 1
        assert dashboard.json()["total_inventory_units"] == 3
        assert dashboard.json()["low_stock_products"] == 1

        assert client.delete(f"/api/v1/categories/{category_id}", headers=headers).status_code == 409
        assert client.delete(f"/api/v1/products/{product_id}", headers=headers).status_code == 204
        assert client.delete(f"/api/v1/categories/{category_id}", headers=headers).status_code == 204
    finally:
        fastapi_app.dependency_overrides.clear()
        Base.metadata.drop_all(engine)
