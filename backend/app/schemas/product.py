from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.category import CategoryResponse


class ProductCreate(BaseModel):
    category_id: UUID
    name: str = Field(min_length=1, max_length=200)
    sku: str = Field(min_length=1, max_length=100)
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=10, ge=0)

    @field_validator("name", "sku")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not normalized:
            raise ValueError("Value must not be blank")
        return normalized


class ProductUpdate(BaseModel):
    category_id: UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=200)
    sku: str | None = Field(default=None, min_length=1, max_length=100)
    price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    low_stock_threshold: int | None = Field(default=None, ge=0)

    @field_validator("name", "sku")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = " ".join(value.split())
        if not normalized:
            raise ValueError("Value must not be blank")
        return normalized


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    category_id: UUID
    name: str
    sku: str
    price: Decimal
    quantity: int
    low_stock_threshold: int
    created_at: datetime
    updated_at: datetime
    category: CategoryResponse


class StockUpdateRequest(BaseModel):
    quantity: int = Field(gt=0)
    movement_type: str = Field(pattern="^(IN|OUT)$")
    reason: str | None = Field(default=None, max_length=2000)


class StockMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID
    movement_type: str
    quantity: int
    reason: str | None
    created_by_id: UUID | None
    created_at: datetime
