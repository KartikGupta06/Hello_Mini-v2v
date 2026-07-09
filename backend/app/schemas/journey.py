from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any

class JourneyHistoryBase(BaseModel):
    origin: str
    destination: str
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    safety_score: Optional[int] = None
    status: str = "active"
    duration_seconds: Optional[int] = None
    completed_at: Optional[datetime] = None
    journey_metadata: Optional[Dict[str, Any]] = None

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
    duration_seconds: Optional[int] = None
    completed_at: Optional[datetime] = None
    journey_metadata: Optional[Dict[str, Any]] = None

class JourneyHistoryInDB(JourneyHistoryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class JourneyHistory(JourneyHistoryInDB):
    pass
