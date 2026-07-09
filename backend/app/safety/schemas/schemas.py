from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional, Dict, Any

class CoordinateLocation(BaseModel):
    lat: float
    lng: float

class CrimeData(BaseModel):
    incident_count: int
    risk_level: str  # low, medium, high
    description: str

class LightingData(BaseModel):
    lighting_level: str  # poor, moderate, excellent
    lamps_count: int
    description: str

class CommunityReportSummary(BaseModel):
    id: int
    type: str
    description: str
    created_at: datetime

class CommunityData(BaseModel):
    active_reports_count: int
    reports: List[CommunityReportSummary]

class WeatherData(BaseModel):
    visibility_meters: float
    condition: str  # clear, rain, fog, etc.
    temperature_c: float

class POIDetails(BaseModel):
    name: str
    address: str
    lat: float
    lng: float
    phone: Optional[str] = None

class POIData(BaseModel):
    police_stations: List[POIDetails]
    hospitals: List[POIDetails]
    pharmacies: List[POIDetails]
    safe_places: List[POIDetails]

class TimeData(BaseModel):
    hour: int
    is_night: bool
    weekday: str

class FutureEventDetails(BaseModel):
    title: str
    description: str
    scheduled_time: datetime

class FutureEventData(BaseModel):
    events_count: int
    events: List[FutureEventDetails]

class ProviderHealth(BaseModel):
    name: str
    status: str  # healthy, degraded, unavailable
    availability: float  # percentage (e.g. 100.0)
    latency_ms: float
    last_update: datetime

class SafetyAggregateResponse(BaseModel):
    location: CoordinateLocation
    timestamp: datetime
    crime: CrimeData
    lighting: LightingData
    community: CommunityData
    weather: WeatherData
    poi: POIData
    time: TimeData
    future_event: FutureEventData
    metadata: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)
