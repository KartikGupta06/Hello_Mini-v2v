from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class JourneyHistoryBase(BaseModel):
    origin: str
    destination: str
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    safety_score: Optional[int] = None
    status: str = "active"

class JourneyHistoryCreate(JourneyHistoryBase):
    user_id: int

class JourneyHistoryUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    dest_lat: Optional[float] = None
    dest_lng: Optional[float] = None
    safety_score: Optional[int] = None
    status: Optional[str] = None

class JourneyHistoryInDB(JourneyHistoryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class JourneyHistory(JourneyHistoryInDB):
    pass
