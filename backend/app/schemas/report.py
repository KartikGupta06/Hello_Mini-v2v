from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Literal

# Validated categories lists of safety report types
ReportCategory = Literal[
    "Street Light Issue",
    "Harassment",
    "Stalking",
    "Broken CCTV",
    "Road Block",
    "Poor Lighting",
    "Suspicious Activity",
    "Other"
]

class CommunityReportBase(BaseModel):
    lat: float
    lng: float
    type: ReportCategory
    description: str

class CommunityReportCreate(CommunityReportBase):
    user_id: Optional[int] = None

class CommunityReportUpdate(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    type: Optional[ReportCategory] = None
    description: Optional[str] = None

class CommunityReportInDB(CommunityReportBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CommunityReport(CommunityReportInDB):
    pass
