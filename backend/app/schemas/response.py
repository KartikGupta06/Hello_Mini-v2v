from typing import Generic, TypeVar, List
from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    count: int
    total: int
    limit: int
    offset: int
    data: List[T]

class SingleResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
