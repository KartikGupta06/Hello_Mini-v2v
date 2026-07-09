import re
from pydantic import BaseModel, field_validator, ConfigDict
from datetime import datetime
from typing import Optional

class EmergencyContactBase(BaseModel):
    name: str
    phone: str
    relationship_type: Optional[str] = None
    is_primary: bool = False

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Enforces phone validation format checks for international digit layouts."""
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?[1-9]\d{6,14}$", cleaned):
            raise ValueError(
                "Phone number must be a valid international format (7-15 digits, optional + prefix)"
            )
        return v

class EmergencyContactCreate(EmergencyContactBase):
    user_id: int

class EmergencyContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    relationship_type: Optional[str] = None
    is_primary: Optional[bool] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?[1-9]\d{6,14}$", cleaned):
            raise ValueError(
                "Phone number must be a valid international format (7-15 digits, optional + prefix)"
            )
        return v

class EmergencyContactInDB(EmergencyContactBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EmergencyContact(EmergencyContactInDB):
    pass
