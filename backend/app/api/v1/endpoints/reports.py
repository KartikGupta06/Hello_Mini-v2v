from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.auth import get_current_user, get_current_user_optional
from app.models.user import User as UserModel
from app.schemas.report import CommunityReport, CommunityReportCreate, CommunityReportUpdate, ReportCategory
from app.services.report import CommunityReportService

router = APIRouter()

@router.get(
    "/", 
    response_model=List[CommunityReport],
    summary="Query safety reports list",
    description="Query safety hazards list applying filters (category), keywords searches, sorting, and paginations."
)
def get_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[ReportCategory] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    return CommunityReportService.get_reports(
        db,
        skip=skip,
        limit=limit,
        type=type,
        search=search,
        sort_by=sort_by,
        order=order
    )

@router.post(
    "/", 
    response_model=CommunityReport,
    status_code=status.HTTP_201_CREATED,
    summary="Submit safety alert report",
    description="Registers new community reports (allows optional authorization header for anonymous reporting)."
)
def create_report(
    obj_in: CommunityReportCreate,
    db: Session = Depends(get_db),
    current_user: Optional[UserModel] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    return CommunityReportService.create_report(db, obj_in=obj_in, user_id=user_id)

@router.get(
    "/{report_id}", 
    response_model=CommunityReport,
    summary="Get safety report logs details",
    description="Retrieve details of specific safety reports by ID."
)
def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    return CommunityReportService.get_report_by_id(db, report_id=report_id)

@router.put(
    "/{report_id}", 
    response_model=CommunityReport,
    summary="Update safety report details",
    description="Modify descriptions or details of safety reports (requires user ownership authorization)."
)
def update_report(
    report_id: int,
    obj_in: CommunityReportUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return CommunityReportService.update_report(
        db, 
        report_id=report_id, 
        obj_in=obj_in, 
        user_id=current_user.id
    )

@router.delete(
    "/{report_id}", 
    response_model=CommunityReport,
    summary="Purge safety report logs",
    description="Purges safety reports from feed logs (requires user ownership authorization)."
)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return CommunityReportService.delete_report(
        db, 
        report_id=report_id, 
        user_id=current_user.id
    )
