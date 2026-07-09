from sqlalchemy import Column, String, Float, Date, CheckConstraint
from app.database.base import Base

class StreetLight(Base):
    __tablename__ = "street_lights"

    light_id = Column(String(50), primary_key=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(100), nullable=False)
    area_name = Column(String(100), nullable=False)
    road_name = Column(String(150), nullable=False)
    light_status = Column(String(50), nullable=False)
    brightness_level = Column(String(50), nullable=False)
    installation_date = Column(Date, nullable=True)
    last_maintenance = Column(Date, nullable=True)

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90.0 AND 90.0", name="check_light_latitude"),
        CheckConstraint("longitude BETWEEN -180.0 AND 180.0", name="check_light_longitude"),
        CheckConstraint("light_status IN ('Working', 'Faulty')", name="check_light_status"),
    )
