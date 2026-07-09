from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class StreetLightBase(BaseModel):
    light_id: str
    latitude: float
    longitude: float
    district: str
    area_name: str
    road_name: str
    light_status: str
    brightness_level: str
    installation_date: Optional[date] = None
    last_maintenance: Optional[date] = None

class StreetLight(StreetLightBase):
    model_config = ConfigDict(from_attributes=True)
