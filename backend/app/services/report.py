from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.report import report_repository
from app.models.report import CommunityReport
from app.schemas.report import CommunityReportCreate, CommunityReportUpdate, ReportCategory
from app.utils.query import apply_pagination, apply_sorting, apply_search, apply_filters

class CommunityReportService:
    @staticmethod
    def get_report_by_id(db: Session, report_id: int) -> CommunityReport:
        """Fetch report by primary key ID, raises 404 if missing."""
        report = report_repository.get(db, id=report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Community safety report not found"
            )
        return report

    @staticmethod
    def get_reports(
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        type: Optional[ReportCategory] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        order: str = "desc"
    ) -> List[CommunityReport]:
        """Fetch safety reports applying filters (category), keywords search, sorting, and pagination."""
        query = db.query(CommunityReport)
        
        # Exact match filters
        filters = {}
        if type:
            filters["type"] = type
        query = apply_filters(query, CommunityReport, filters)
        
        # Substring keyword search over description
        if search:
            query = apply_search(query, CommunityReport, search_query=search, fields=["description"])
            
        # Apply sorting and pagination
        query = apply_sorting(query, CommunityReport, sort_by=sort_by, order=order)
        query = apply_pagination(query, skip=skip, limit=limit)
        
        return query.all()

    @staticmethod
    def create_report(db: Session, obj_in: CommunityReportCreate, user_id: Optional[int] = None) -> CommunityReport:
        """Submit safety reports (allows optional user ID link for anonymity)."""
        obj_in.user_id = user_id
        return report_repository.create(db, obj_in=obj_in)

    @staticmethod
    def update_report(
        db: Session, 
        report_id: int, 
        obj_in: CommunityReportUpdate, 
        user_id: int
    ) -> CommunityReport:
        """Modify report description or details, validating ownership check constraints."""
        report = CommunityReportService.get_report_by_id(db, report_id=report_id)
        
        # Prevent unauthorized updates on owned reports
        if report.user_id is not None and report.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to modify this report record"
            )
            
        return report_repository.update(db, db_obj=report, obj_in=obj_in)

    @staticmethod
    def delete_report(db: Session, report_id: int, user_id: int) -> CommunityReport:
        """Purge report alerts, validating ownership check constraints."""
        report = CommunityReportService.get_report_by_id(db, report_id=report_id)
        
        if report.user_id is not None and report.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to delete this report record"
            )
            
        return report_repository.remove(db, id=report_id)
