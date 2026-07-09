from sqlalchemy import Column, String, Float, Date, CheckConstraint
from app.database.base import Base

class CCTVCamera(Base):
    __tablename__ = "cctv_cameras"

    cctv_id = Column(String(50), primary_key=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(100), nullable=False)
    area_name = Column(String(100), nullable=False)
    road_name = Column(String(150), nullable=False)
    camera_status = Column(String(50), nullable=False)
    coverage_radius = Column(Float, nullable=False)
    installation_date = Column(Date, nullable=True)
    owner = Column(String(50), nullable=False)

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90.0 AND 90.0", name="check_cctv_latitude"),
        CheckConstraint("longitude BETWEEN -180.0 AND 180.0", name="check_cctv_longitude"),
        CheckConstraint("camera_status IN ('Working', 'Faulty')", name="check_cctv_status"),
    )
