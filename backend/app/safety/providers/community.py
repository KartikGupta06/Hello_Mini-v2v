import time
from sqlalchemy.orm import Session
from app.safety.providers.base import BaseSafetyProvider
from app.database.session import SessionLocal
from app.models.report import CommunityReport

class CommunityReportsProvider(BaseSafetyProvider):
    def __init__(self):
        super().__init__("Community Reports Provider")

    async def fetch_data(self, lat: float, lng: float, db: Session = None) -> dict:
        """Fetch actual database reports logged within a coordinate bounding box delta."""
        start_time = time.time()
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
            
        try:
            delta = 0.02  # Approximately 2.2 km radius bounding box
            reports = db.query(CommunityReport).filter(
                CommunityReport.lat >= lat - delta,
                CommunityReport.lat <= lat + delta,
                CommunityReport.lng >= lng - delta,
                CommunityReport.lng <= lng + delta
            ).all()
            
            reports_list = []
            for r in reports:
                reports_list.append({
                    "id": r.id,
                    "type": r.type,
                    "description": r.description,
                    "created_at": r.created_at
                })
                
            self.record_success((time.time() - start_time) * 1000)
            return {
                "active_reports_count": len(reports_list),
                "reports": reports_list
            }
        except Exception:
            self.record_failure()
            raise
        finally:
            if close_db:
                db.close()
