from app.ai.risk_modules.base import BaseRiskModule

class LightingRiskModule(BaseRiskModule):
    def __init__(self):
        super().__init__("Lighting Risk")

    def evaluate(self, data: dict) -> dict:
        """Evaluates street lighting levels returning risk scores and explanation reasons."""
        lighting_data = data.get("lighting", {})
        level = lighting_data.get("lighting_level", "moderate").lower()
        lamps = lighting_data.get("lamps_count", 0)

        # Calculate risk score
        if level == "poor":
            risk_score = 80.0
            reason = "Deficient street lighting levels increase night transit vulnerability."
        elif level == "moderate":
            risk_score = 40.0
            reason = "Moderate street lighting coverage detected."
        else:
            risk_score = 5.0
            reason = "Excellent active street lighting coverage reduces ambient dark hazards."

        return {
            "risk_score": risk_score,
            "confidence": 1.0,
            "reason": reason,
            "metadata": {
                "lighting_level": level,
                "lamps_count": lamps
            }
        }
