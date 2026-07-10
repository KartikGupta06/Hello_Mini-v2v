from typing import Dict, Any

class SafetyScoreEngine:
    def __init__(self):
        self.name = "Safety Score Engine"

    def calculate_score(self, total_accumulated_risk: float) -> Dict[str, Any]:
        """Calculates safety score and determines the risk category."""
        # Safety Score derived directly from accumulated risk
        safety_score = max(0.0, min(100.0, 100.0 - total_accumulated_risk))
        safety_score = round(safety_score, 2)

        # Categorize safety level
        if safety_score >= 85.0:
            category = "Very Safe"
        elif safety_score >= 70.0:
            category = "Safe"
        elif safety_score >= 50.0:
            category = "Moderate"
        elif safety_score >= 30.0:
            category = "Risky"
        else:
            category = "Dangerous"

        return {
            "safety_score": safety_score,
            "risk_category": category
        }
