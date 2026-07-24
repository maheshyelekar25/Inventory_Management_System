from math import ceil
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import AdminUser
from app.db.session import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.common import Page

router = APIRouter(prefix="/categories", tags=["categories"])
DBSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=Page[CategoryResponse])
def list_categories(
    _: AdminUser,
    db: DBSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=100),
) -> Page[CategoryResponse]:
    filters = [Category.name.ilike(f"%{search.strip()}%")] if search and search.strip() else []
    total = db.scalar(select(func.count()).select_from(Category).where(*filters)) or 0
    categories = db.scalars(
        select(Category).where(*filters).order_by(Category.name).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return Page(items=categories, total=total, page=page, page_size=page_size, pages=ceil(total / page_size) if total else 0)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, _: AdminUser, db: DBSession) -> Category:
    category = Category(**payload.model_dump())
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A category with this name already exists") from None
    db.refresh(category)
    return category


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: UUID, _: AdminUser, db: DBSession) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: UUID, payload: CategoryUpdate, _: AdminUser, db: DBSession) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A category with this name already exists") from None
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: UUID, _: AdminUser, db: DBSession) -> Response:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    product_count = db.scalar(select(func.count()).select_from(Product).where(Product.category_id == category_id)) or 0
    if product_count:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot delete a category that contains products")
    db.delete(category)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
