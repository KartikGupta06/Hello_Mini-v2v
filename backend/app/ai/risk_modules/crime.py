from app.ai.risk_modules.base import BaseRiskModule

class CrimeRiskModule(BaseRiskModule):
    def __init__(self):
        super().__init__("Crime Risk")

    def evaluate(self, data: dict) -> dict:
        """Evaluates historical crime levels returning risk scores and explanation reasons."""
        crime_data = data.get("crime", {})
        risk_level = crime_data.get("risk_level", "low").lower()
        incident_count = crime_data.get("incident_count", 0)

        # Calculate risk score
        if risk_level == "high":
            risk_score = 85.0
            reason = "High volume of historical safety incidents logged in this sector."
        elif risk_level == "medium":
            risk_score = 45.0
            reason = "Moderate volume of historical safety incidents logged."
        else:
            risk_score = 10.0
            reason = "Low historical crime incidents registered."

        return {
            "risk_score": risk_score,
            "confidence": 1.0,
            "reason": reason,
            "metadata": {
                "risk_level": risk_level,
                "incident_count": incident_count
            }
        }
