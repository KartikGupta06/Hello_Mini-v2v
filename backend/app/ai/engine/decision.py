import logging
from typing import Dict, Any, List

from app.ai.risk_modules import (
    CrimeRiskModule,
    LightingRiskModule,
    CommunityRiskModule,
    WeatherRiskModule,
    TimeRiskModule,
    POIRiskModule,
    FutureEventRiskModule,
)
from app.ai.weights.config import RISK_WEIGHTS, POI_MITIGATION_CAP
from app.ai.confidence.engine import ConfidenceEngine
from app.ai.reasoning.generator import ReasonGenerator
from app.ai.schemas.schemas import SafetyScoreResponse, ModuleBreakdown

logger = logging.getLogger("safety_decision_engine")

class SafetyDecisionEngine:
    def __init__(self):
        """Initializes decision engine risk modules mappings."""
        self.risk_modules = [
            CrimeRiskModule(),
            LightingRiskModule(),
            CommunityRiskModule(),
            WeatherRiskModule(),
            TimeRiskModule(),
            FutureEventRiskModule(),
            POIRiskModule()  # Mitigation module
        ]

    def evaluate_safety(self, aggregated_data: dict) -> SafetyScoreResponse:
        """Processes safety variables resolving final safety scores, confidence levels, and categorizations."""
        module_results = {}
        raw_risk = 0.0
        poi_mitigation = 0.0
        
        # 1. Run all independent modules
        for module in self.risk_modules:
            try:
                res = module.evaluate(aggregated_data)
                module_results[module.name] = res
            except Exception as e:
                logger.error(f"Failed evaluating module {module.name}: {str(e)}", exc_info=True)
                # Fallback to zero risk/neutral parameters on module failure
                module_results[module.name] = {
                    "risk_score": 0.0,
                    "confidence": 0.0,
                    "reason": f"Evaluation offline for {module.name}.",
                    "metadata": {}
                }

        # 2. Apply weights to compute raw transit risk
        for name, weight in RISK_WEIGHTS.items():
            module_res = module_results.get(name, {})
            score = module_res.get("risk_score", 0.0)
            raw_risk += score * weight

        # 3. Apply POI mitigator discount points
        poi_res = module_results.get("POI Risk", {})
        poi_score = poi_res.get("risk_score", 0.0)  # Neg value representing mitigation
        if poi_score < 0:
            poi_mitigation = min(abs(poi_score), POI_MITIGATION_CAP)
            
        final_risk = max(0.0, raw_risk - poi_mitigation)
        
        # 4. Calculate overall Safety Score (100 = Safest, 0 = Highest Risk)
        safety_score = max(0.0, min(100.0, 100.0 - final_risk))
        safety_score = round(safety_score, 2)

        # 5. Map overall Safety Score to Risk Category
        if safety_score >= 85.0:
            category = "Very Safe"
        elif safety_score >= 70.0:
            category = "Safe"
        elif safety_score >= 55.0:
            category = "Moderate"
        elif safety_score >= 40.0:
            category = "Risky"
        elif safety_score >= 25.0:
            category = "High Risk"
        else:
            category = "Critical"

        # 6. Run Confidence calculation
        confidence_level, confidence_pct = ConfidenceEngine.calculate_confidence(aggregated_data)

        # 7. Consolidate explanation reasons
        reasons = ReasonGenerator.generate_reasons(module_results)

        # Formulate breakdown models
        breakdown_models = {}
        for name, res in module_results.items():
            breakdown_models[name] = ModuleBreakdown(
                risk_score=res["risk_score"],
                confidence=res["confidence"],
                reason=res["reason"],
                metadata=res["metadata"]
            )

        return SafetyScoreResponse(
            safety_score=safety_score,
            confidence_level=confidence_level,
            confidence_percentage=round(confidence_pct, 2),
            risk_category=category,
            reasons=reasons,
            module_breakdown=breakdown_models
        )

# Global decision engine instance
safety_decision_engine = SafetyDecisionEngine()
