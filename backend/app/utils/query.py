from typing import Any, List, Type, TypeVar
from sqlalchemy.orm import Query
from sqlalchemy import or_, desc, asc
from app.database.base import Base

ModelType = TypeVar("ModelType", bound=Base)

def apply_pagination(query: Query, skip: int = 0, limit: int = 100) -> Query:
    """Applies generic pagination parameters to any SQLAlchemy query."""
    return query.offset(skip).limit(limit)

def apply_sorting(
    query: Query, 
    model: Type[ModelType], 
    sort_by: str = None, 
    order: str = "asc"
) -> Query:
    """Dynamically applies sorting to queries based on model columns."""
    if not sort_by:
        return query
        
    column = getattr(model, sort_by, None)
    if column is None:
        return query
        
    if order.lower() == "desc":
        return query.order_by(desc(column))
    return query.order_by(asc(column))

def apply_search(
    query: Query, 
    model: Type[ModelType], 
    search_query: str = None, 
    fields: List[str] = None
) -> Query:
    """Applies case-insensitive substring filter matching over defined fields list."""
    if not search_query or not fields:
        return query
        
    filters = []
    for field in fields:
        column = getattr(model, field, None)
        if column is not None and hasattr(column, "ilike"):
            filters.append(column.ilike(f"%{search_query}%"))
            
    if filters:
        return query.filter(or_(*filters))
    return query

def apply_filters(
    query: Query, 
    model: Type[ModelType], 
    filters: dict
) -> Query:
    """Applies exact match filters dynamically based on dict filters parameters."""
    for key, value in filters.items():
        if value is None:
            continue
        column = getattr(model, key, None)
        if column is not None:
            # Handle array/list parameters
            if isinstance(value, list):
                query = query.filter(column.in_(value))
            else:
                query = query.filter(column == value)
    return query
