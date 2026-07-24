from math import ceil
from decimal import Decimal
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.api.deps import AdminUser
from app.db.session import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.stock_movement import MovementType, StockMovement
from app.schemas.common import Page
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate, StockMovementResponse, StockUpdateRequest

router = APIRouter(prefix="/products", tags=["products"])
DBSession = Annotated[Session, Depends(get_db)]


def get_product_or_404(db: Session, product_id: UUID, *, load_category: bool = True) -> Product:
    statement = select(Product).where(Product.id == product_id)
    if load_category:
        statement = statement.options(joinedload(Product.category))
    product = db.scalar(statement)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.get("", response_model=Page[ProductResponse])
def list_products(
    _: AdminUser,
    db: DBSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=200),
    category_id: UUID | None = None,
    low_stock: bool | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
) -> Page[ProductResponse]:
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="min_price cannot exceed max_price")
    filters = []
    if search and search.strip():
        term = f"%{search.strip()}%"
        filters.append(or_(Product.name.ilike(term), Product.sku.ilike(term)))
    if category_id is not None:
        filters.append(Product.category_id == category_id)
    if low_stock is True:
        filters.append(Product.quantity <= Product.low_stock_threshold)
    if low_stock is False:
        filters.append(Product.quantity > Product.low_stock_threshold)
    if min_price is not None:
        filters.append(Product.price >= min_price)
    if max_price is not None:
        filters.append(Product.price <= max_price)
    total = db.scalar(select(func.count()).select_from(Product).where(*filters)) or 0
    products = db.scalars(
        select(Product)
        .options(joinedload(Product.category))
        .where(*filters)
        .order_by(Product.name, Product.sku)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return Page(items=products, total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, _: AdminUser, db: DBSession) -> Product:
    if db.get(Category, payload.category_id) is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Category does not exist")
    product = Product(**payload.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A product with this SKU already exists") from None
    return get_product_or_404(db, product.id)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: UUID, _: AdminUser, db: DBSession) -> Product:
    return get_product_or_404(db, product_id)


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(product_id: UUID, payload: ProductUpdate, _: AdminUser, db: DBSession) -> Product:
    product = get_product_or_404(db, product_id)
    updates = payload.model_dump(exclude_unset=True)
    if "category_id" in updates and db.get(Category, updates["category_id"]) is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Category does not exist")
    for field, value in updates.items():
        setattr(product, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A product with this SKU already exists") from None
    return get_product_or_404(db, product_id)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: UUID, _: AdminUser, db: DBSession) -> Response:
    product = get_product_or_404(db, product_id, load_category=False)
    db.delete(product)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{product_id}/stock", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
def update_stock(product_id: UUID, payload: StockUpdateRequest, current_user: AdminUser, db: DBSession) -> StockMovement:
    """Atomically adjust stock and record an immutable stock movement."""
    product = db.scalar(select(Product).where(Product.id == product_id).with_for_update())
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    movement_type = MovementType(payload.movement_type)
    if movement_type is MovementType.OUT and product.quantity < payload.quantity:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Insufficient stock for this adjustment")
    product.quantity += payload.quantity if movement_type is MovementType.IN else -payload.quantity
    movement = StockMovement(
        product_id=product.id,
        movement_type=movement_type,
        quantity=payload.quantity,
        reason=payload.reason,
        created_by_id=current_user.id,
    )
    db.add(movement)
    db.commit()
    db.refresh(movement)
    return movement
