from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EmergencyContactBase(BaseModel):
    name: str
    phone: str
    relationship: Optional[str] = None

class EmergencyContactCreate(EmergencyContactBase):
    user_id: int

class EmergencyContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None

class EmergencyContactInDB(EmergencyContactBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class EmergencyContact(EmergencyContactInDB):
    pass
