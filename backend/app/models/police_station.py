from sqlalchemy import Column, String, Float, Boolean, Text, CheckConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base

class PoliceStation(Base):
    __tablename__ = "police_stations"

    station_id = Column(String(50), primary_key=True, nullable=False)
    station_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(100), nullable=False)
    address = Column(Text, nullable=True)
    contact_number = Column(String(50), nullable=True)
    open_24x7 = Column(Boolean, nullable=False, default=True)

    # Relationships
    crime_records = relationship("CrimeRecord", back_populates="police_station")

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90.0 AND 90.0", name="check_police_latitude"),
        CheckConstraint("longitude BETWEEN -180.0 AND 180.0", name="check_police_longitude"),
    )
