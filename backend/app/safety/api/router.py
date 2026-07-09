from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.safety.schemas.schemas import SafetyAggregateResponse, ProviderHealth
from app.safety.aggregator.aggregator import safety_aggregator

router = APIRouter()

@router.get(
    "/aggregate", 
    response_model=SafetyAggregateResponse,
    summary="Fetch aggregated safety intelligence metrics",
    description="Gathers parameters (crime, lighting, reports, weather, POIs, time) concurrently."
)
async def get_safety_metrics(
    lat: float = Query(..., description="Latitude coordinate"),
    lng: float = Query(..., description="Longitude coordinate"),
    db: Session = Depends(get_db)
):
    return await safety_aggregator.aggregate(lat=lat, lng=lng, db=db)

@router.get(
    "/health", 
    response_model=List[ProviderHealth],
    summary="Safety Providers health status summary",
    description="Check individual data providers latency, availability percentages, and status alerts."
)
def get_providers_health():
    return safety_aggregator.get_providers_health()
