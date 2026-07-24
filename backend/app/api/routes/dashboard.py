from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import AdminUser
from app.db.session import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.dashboard import DashboardStatistics

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
DBSession = Annotated[Session, Depends(get_db)]


@router.get("/statistics", response_model=DashboardStatistics)
def get_dashboard_statistics(_: AdminUser, db: DBSession, low_stock_limit: int = Query(default=5, ge=1, le=100)) -> DashboardStatistics:
    total_products = db.scalar(select(func.count()).select_from(Product)) or 0
    total_categories = db.scalar(select(func.count()).select_from(Category)) or 0
    total_units = db.scalar(select(func.coalesce(func.sum(Product.quantity), 0))) or 0
    inventory_value = db.scalar(select(func.coalesce(func.sum(Product.price * Product.quantity), 0))) or 0
    low_stock_products = db.scalars(
        select(Product)
        .options(joinedload(Product.category))
        .where(Product.quantity <= Product.low_stock_threshold)
        .order_by(Product.quantity, Product.name)
        .limit(low_stock_limit)
    ).all()
    low_stock_total = db.scalar(
        select(func.count()).select_from(Product).where(Product.quantity <= Product.low_stock_threshold)
    ) or 0
    return DashboardStatistics(
        total_products=total_products,
        total_categories=total_categories,
        total_inventory_units=total_units,
        inventory_value=inventory_value,
        low_stock_products=low_stock_total,
        low_stock_items=low_stock_products,
    )
