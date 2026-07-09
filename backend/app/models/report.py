from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.base import Base

class CommunityReport(Base):
    __tablename__ = "community_reports"

    id = Column(Integer, primary key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # e.g., poorly-lit, theft, harassment, obstruction
    description = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
