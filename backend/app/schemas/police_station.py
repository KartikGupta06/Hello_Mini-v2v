from pydantic import BaseModel, ConfigDict
from typing import Optional

class PoliceStationBase(BaseModel):
    station_id: str
    station_name: str
    latitude: float
    longitude: float
    district: str
    address: Optional[str] = None
    contact_number: Optional[str] = None
    open_24x7: bool

class PoliceStation(PoliceStationBase):
    model_config = ConfigDict(from_attributes=True)
