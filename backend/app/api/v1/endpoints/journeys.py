from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User as UserModel
from app.schemas.journey import JourneyHistory, JourneyHistoryCreate, JourneyHistoryUpdate
from app.services.journey import JourneyHistoryService

router = APIRouter()

@router.get(
    "/", 
    response_model=List[JourneyHistory],
    summary="List all user journeys history logs",
    description="Returns pagination lists of navigation trips completed or active under user profile."
)
def get_journeys(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return JourneyHistoryService.get_user_journeys(
        db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit,
        sort_by=sort_by,
        order=order
    )

@router.post(
    "/", 
    response_model=JourneyHistory,
    status_code=status.HTTP_201_CREATED,
    summary="Log a new navigation journey",
    description="Stores start location coordinates, destinations, and status."
)
def create_journey(
    obj_in: JourneyHistoryCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return JourneyHistoryService.create_journey(
        db, 
        obj_in=obj_in, 
        user_id=current_user.id
    )

@router.get(
    "/{journey_id}", 
    response_model=JourneyHistory,
    summary="Get single journey logs details",
    description="Fetch single journey records after verifying user ownership checks."
)
def get_journey(
    journey_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return JourneyHistoryService.get_journey_by_id(
        db, 
        journey_id=journey_id, 
        user_id=current_user.id
    )

@router.put(
    "/{journey_id}", 
    response_model=JourneyHistory,
    summary="Update journey logs details",
    description="Modify travel durations, completion stamps, metadata payloads, or statuses."
)
def update_journey(
    journey_id: int,
    obj_in: JourneyHistoryUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return JourneyHistoryService.update_journey(
        db, 
        journey_id=journey_id, 
        obj_in=obj_in, 
        user_id=current_user.id
    )

@router.delete(
    "/{journey_id}", 
    response_model=JourneyHistory,
    summary="Purge journey logs",
    description="Deletes route history items from user records."
)
def delete_journey(
    journey_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return JourneyHistoryService.delete_journey(
        db, 
        journey_id=journey_id, 
        user_id=current_user.id
    )
