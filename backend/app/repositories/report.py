from app.repositories.base import BaseRepository
from app.models.report import CommunityReport
from app.schemas.report import CommunityReportCreate, CommunityReportUpdate

class CommunityReportRepository(
    BaseRepository[CommunityReport, CommunityReportCreate, CommunityReportUpdate]
):
    pass

report_repository = CommunityReportRepository(CommunityReport)
