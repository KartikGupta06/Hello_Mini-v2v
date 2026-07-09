from pydantic import BaseModel, ConfigDict
from datetime import date, time
from typing import Optional

class CrimeRecordBase(BaseModel):
    crime_id: str
    latitude: float
    longitude: float
    district: str
    area_name: str
    road_name: str
    crime_type: str
    crime_severity: str
    crime_date: date
    crime_time: time
    victim_gender: Optional[str] = None
    station_id: str
    risk_score: int

class CrimeRecord(CrimeRecordBase):
    model_config = ConfigDict(from_attributes=True)
