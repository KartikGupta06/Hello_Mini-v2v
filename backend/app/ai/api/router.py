from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.ai.schemas.schemas import SafetyScoreResponse
from app.ai.services.ai_service import AIService

router = APIRouter()

@router.get(
    "/safety-score", 
    response_model=SafetyScoreResponse,
    summary="Calculate explainable transit safety score",
    description="Resolves metrics around coordinates and applies configurable weights to output safety scores and reasoning summaries."
)
async def get_safety_score(
    lat: float = Query(..., description="Latitude coordinate location"),
    lng: float = Query(..., description="Longitude coordinate location"),
    db: Session = Depends(get_db)
):
    return await AIService.get_safety_score_for_coordinates(lat=lat, lng=lng, db=db)
