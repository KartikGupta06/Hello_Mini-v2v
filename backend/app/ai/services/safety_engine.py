from datetime import datetime, time, date
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.ai.analyzers.crime_analyzer import CrimeAnalyzer
from app.ai.analyzers.infrastructure_analyzer import InfrastructureAnalyzer
from app.ai.analyzers.emergency_analyzer import EmergencyAnalyzer
from app.ai.analyzers.time_risk_analyzer import TimeRiskAnalyzer

from app.ai.core.risk_aggregator import RiskAggregator
from app.ai.core.safety_score import SafetyScoreEngine
from app.ai.core.confidence_engine import ConfidenceEngine
from app.ai.core.explanation_generator import ExplanationGenerator

class SafetyEngine:
    def __init__(self):
        self.crime_analyzer = CrimeAnalyzer()
        self.infra_analyzer = InfrastructureAnalyzer()
        self.emergency_analyzer = EmergencyAnalyzer()
        self.time_analyzer = TimeRiskAnalyzer()
        self.aggregator = RiskAggregator()
        self.score_engine = SafetyScoreEngine()
        self.confidence_engine = ConfidenceEngine()
        self.explanation_gen = ExplanationGenerator()

    def evaluate_safety(
        self, 
        db: Session, 
        lat: float, 
        lng: float, 
        current_time: time = None,
        current_date: date = None
    ) -> Dict[str, Any]:
        """Orchestrates safety calculations across independent analyzers, aggregating scores and explanations."""
        if current_time is None:
            current_time = datetime.now().time()
        if current_date is None:
            current_date = datetime.now().date()

        # 1. Run Analyzers
        crime_res = self.crime_analyzer.evaluate(db, lat, lng, evaluation_date=current_date)
        infra_res = self.infra_analyzer.evaluate(db, lat, lng)
        emergency_res = self.emergency_analyzer.evaluate(db, lat, lng)
        time_res = self.time_analyzer.evaluate(current_time=current_time)

        # 2. Run Core Scoring / Aggregation
        agg_res = self.aggregator.aggregate(crime_res, infra_res, time_res)
        score_res = self.score_engine.calculate_score(agg_res["total_accumulated_risk"])
        confidence_res = self.confidence_engine.evaluate(db, lat, lng)

        # 3. Generate Human-Readable Explanations
        expl_res = self.explanation_gen.generate(
            crime_res, infra_res, emergency_res, time_res, confidence_res
        )

        # 4. Formulate Unified Response
        return {
            "safety_score": score_res["safety_score"],
            "risk_level": score_res["risk_category"],
            "confidence_percentage": confidence_res["confidence_percentage"],
            "confidence_level": confidence_res["confidence_level"],
            "emergency_readiness_score": emergency_res["emergency_readiness_score"],
            "readiness_level": emergency_res["readiness_level"],
            "risk_breakdown": {
                "crime_risk": crime_res["crime_risk"],
                "infrastructure_risk": infra_res["infrastructure_risk"],
                "total_accumulated_risk": agg_res["total_accumulated_risk"],
                "adjusted_crime_risk": agg_res["adjusted_crime_risk"],
                "adjusted_infrastructure_risk": agg_res["adjusted_infra_risk"],
                "crime_multiplier": agg_res["crime_multiplier_applied"],
                "infrastructure_multiplier": agg_res["infrastructure_multiplier_applied"],
                "emergency_readiness_score": emergency_res["emergency_readiness_score"],
                "telemetry_points_count": confidence_res["total_telemetry_points"]
            },
            "ai_explanation": {
                "why_this_route": expl_res["why_this_route"],
                "risks_and_warnings": expl_res["risks_and_warnings"]
            }
        }

# Global orchestrator instance
safety_engine = SafetyEngine()
