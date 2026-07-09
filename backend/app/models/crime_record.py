from sqlalchemy import Column, String, Float, Integer, Date, Time, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base

class CrimeRecord(Base):
    __tablename__ = "crime_records"

    crime_id = Column(String(50), primary_key=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(100), nullable=False)
    area_name = Column(String(100), nullable=False)
    road_name = Column(String(150), nullable=False)
    crime_type = Column(String(100), nullable=False)
    crime_severity = Column(String(50), nullable=False)
    crime_date = Column(Date, nullable=False)
    crime_time = Column(Time, nullable=False)
    victim_gender = Column(String(50), nullable=True)
    station_id = Column(String(50), ForeignKey("police_stations.station_id"), nullable=False)
    risk_score = Column(Integer, nullable=False)

    # Relationships
    police_station = relationship("PoliceStation", back_populates="crime_records")

    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90.0 AND 90.0", name="check_crime_latitude"),
        CheckConstraint("longitude BETWEEN -180.0 AND 180.0", name="check_crime_longitude"),
        CheckConstraint("crime_severity IN ('High', 'Medium', 'Low')", name="check_crime_severity"),
        CheckConstraint("risk_score BETWEEN 0 AND 100", name="check_crime_risk_score"),
    )
