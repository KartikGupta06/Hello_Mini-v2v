from app.ai.risk_modules.base import BaseRiskModule

class WeatherRiskModule(BaseRiskModule):
    def __init__(self):
        super().__init__("Weather Risk")

    def evaluate(self, data: dict) -> dict:
        """Evaluates transit visibility and weather conditions returning risk scores."""
        weather_data = data.get("weather", {})
        condition = weather_data.get("condition", "clear").lower()
        visibility = weather_data.get("visibility_meters", 10000.0)

        # Scale risk based on weather constraints
        if condition == "fog" or visibility < 1000.0:
            risk_score = 75.0
            reason = "Severe visibility degradation due to foggy conditions."
        elif condition == "rain":
            risk_score = 35.0
            reason = "Precipitation and wet paths increase transit slip hazards."
        else:
            risk_score = 0.0
            reason = "Clear weather conditions ensure optimal visibility."

        return {
            "risk_score": risk_score,
            "confidence": 1.0,
            "reason": reason,
            "metadata": {
                "condition": condition,
                "visibility_meters": visibility
            }
        }
