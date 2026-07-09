from pydantic import BaseModel, ConfigDict
from typing import Optional

class HospitalBase(BaseModel):
    hospital_id: str
    hospital_name: str
    latitude: float
    longitude: float
    district: str
    address: Optional[str] = None
    emergency_available: bool
    contact_number: Optional[str] = None
    open_24x7: bool

class Hospital(HospitalBase):
    model_config = ConfigDict(from_attributes=True)
