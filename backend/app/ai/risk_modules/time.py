from app.ai.risk_modules.base import BaseRiskModule

class TimeRiskModule(BaseRiskModule):
    def __init__(self):
        super().__init__("Time Risk")

    def evaluate(self, data: dict) -> dict:
        """Evaluates late night transit baselines returning risk scores."""
        time_data = data.get("time", {})
        hour = time_data.get("hour", 12)
        is_night = time_data.get("is_night", False)

        # Baseline night risk scaling
        if is_night:
            risk_score = 65.0
            reason = f"Late night hours ({hour}:00 UTC) increase ambient transit vulnerabilities."
        else:
            risk_score = 0.0
            reason = "Daylight transit hours provide excellent ambient visibility."

        return {
            "risk_score": risk_score,
            "confidence": 1.0,
            "reason": reason,
            "metadata": {
                "hour": hour,
                "is_night": is_night
            }
        }
