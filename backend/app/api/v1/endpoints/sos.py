from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.database.session import get_db
from app.services.sos import SOSService

router = APIRouter()

class SOSRequest(BaseModel):
    latitude: float = Field(..., description="Current latitude of the user", ge=-90.0, le=90.0)
    longitude: float = Field(..., description="Current longitude of the user", ge=-180.0, le=180.0)

@router.post(
    "/trigger",
    status_code=status.HTTP_200_OK,
    summary="Trigger SOS Emergency",
    description="Processes user's coordinates to fetch the nearest police stations and hospitals."
)
def trigger_sos(
    request: SOSRequest,
    db: Session = Depends(get_db)
):
    try:
        results = SOSService.find_nearest_services(
            db=db,
            latitude=request.latitude,
            longitude=request.longitude
        )
        return results
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing SOS: {str(e)}"
        )
