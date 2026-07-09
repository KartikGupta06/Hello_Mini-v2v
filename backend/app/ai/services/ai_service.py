from sqlalchemy.orm import Session
from app.safety.aggregator.aggregator import safety_aggregator
from app.ai.engine.decision import safety_decision_engine
from app.ai.schemas.schemas import SafetyScoreResponse

class AIService:
    @staticmethod
    async def get_safety_score_for_coordinates(
        lat: float, 
        lng: float, 
        db: Session = None
    ) -> SafetyScoreResponse:
        """Fetches aggregated parameters from SafetyAggregator and runs decision calculations."""
        # 1. Fetch aggregated data (resolving DB context parameters)
        aggregated_data = await safety_aggregator.aggregate(lat=lat, lng=lng, db=db)
        
        # 2. Evaluate transit safety metrics
        data_dict = aggregated_data.model_dump()
        return safety_decision_engine.evaluate_safety(data_dict)
