from sqlalchemy.orm import Session
from app.ai.schemas.schemas import SafetyScoreResponse, ModuleBreakdown
from app.ai.services.safety_engine import safety_engine

class AIService:
    @staticmethod
    async def get_safety_score_for_coordinates(
        lat: float, 
        lng: float, 
        db: Session = None
    ) -> SafetyScoreResponse:
        """Evaluates route coordinate safety using the modular SafetyEngine, mapping results to schemas."""
        res = safety_engine.evaluate_safety(db=db, lat=lat, lng=lng)
        
        combined_reasons = res["ai_explanation"]["why_this_route"] + res["ai_explanation"]["risks_and_warnings"]
        
        # Populate old breakdown schema format for backward compatibility and test assertions
        breakdown = {
            "Crime Risk": ModuleBreakdown(
                risk_score=res["risk_breakdown"]["crime_risk"],
                confidence=res["confidence_percentage"] / 100.0,
                reason=res["ai_explanation"]["risks_and_warnings"][0] if res["ai_explanation"]["risks_and_warnings"] else "No recent crime incidents.",
                metadata={}
            ),
            "POI Risk": ModuleBreakdown(
                risk_score=-res["emergency_readiness_score"],
                confidence=res["confidence_percentage"] / 100.0,
                reason="Emergency services checked.",
                metadata={}
            ),
            "Lighting Risk": ModuleBreakdown(
                risk_score=res["risk_breakdown"]["infrastructure_risk"],
                confidence=res["confidence_percentage"] / 100.0,
                reason="Lighting status checked.",
                metadata={}
            )
        }
        
        return SafetyScoreResponse(
            safety_score=res["safety_score"],
            confidence_level=res["confidence_level"],
            confidence_percentage=res["confidence_percentage"],
            risk_category=res["risk_level"],
            reasons=combined_reasons,
            module_breakdown=breakdown,
            emergency_readiness_score=res["emergency_readiness_score"],
            readiness_level=res["readiness_level"],
            risk_breakdown=res["risk_breakdown"],
            ai_explanation=res["ai_explanation"]
        )
