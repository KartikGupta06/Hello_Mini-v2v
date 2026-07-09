from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CommunityReportBase(BaseModel):
    lat: float
    lng: float
    type: str
    description: str

class CommunityReportCreate(CommunityReportBase):
    user_id: Optional[int] = None

class CommunityReportUpdate(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    type: Optional[str] = None
    description: Optional[str] = None

class CommunityReportInDB(CommunityReportBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CommunityReport(CommunityReportInDB):
    pass
