from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any

class ModuleBreakdown(BaseModel):
    risk_score: float
    confidence: float
    reason: str
    metadata: Dict[str, Any]

class SafetyScoreResponse(BaseModel):
    safety_score: float
    confidence_level: str  # High, Medium, Low
    confidence_percentage: float
    risk_category: str  # Very Safe, Safe, Moderate, Risky, High Risk, Critical
    reasons: List[str]
    module_breakdown: Dict[str, ModuleBreakdown]

    model_config = ConfigDict(from_attributes=True)
