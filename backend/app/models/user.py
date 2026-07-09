from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )

    # Relationships
    emergency_contacts = relationship(
        "EmergencyContact", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    journeys = relationship(
        "JourneyHistory", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    reports = relationship(
        "CommunityReport", 
        back_populates="user"
    )
