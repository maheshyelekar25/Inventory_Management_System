from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.product import ProductResponse


class DashboardStatistics(BaseModel):
    total_products: int = Field(ge=0)
    total_categories: int = Field(ge=0)
    total_inventory_units: int = Field(ge=0)
    inventory_value: Decimal = Field(ge=0)
    low_stock_products: int = Field(ge=0)
    low_stock_items: list[ProductResponse]
