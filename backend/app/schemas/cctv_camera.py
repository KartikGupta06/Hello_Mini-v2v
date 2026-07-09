from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class CCTVCameraBase(BaseModel):
    cctv_id: str
    latitude: float
    longitude: float
    district: str
    area_name: str
    road_name: str
    camera_status: str
    coverage_radius: float
    installation_date: Optional[date] = None
    owner: str

class CCTVCamera(CCTVCameraBase):
    model_config = ConfigDict(from_attributes=True)
