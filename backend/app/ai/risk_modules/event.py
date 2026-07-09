from app.ai.risk_modules.base import BaseRiskModule

class FutureEventRiskModule(BaseRiskModule):
    def __init__(self):
        super().__init__("Future Event Risk")

    def evaluate(self, data: dict) -> dict:
        """Evaluates scheduled public gatherings nearby coordinates returning risk scores."""
        event_data = data.get("future_event", {})
        count = event_data.get("events_count", 0)

        # Scale risk based on events
        risk_score = min(count * 25.0, 100.0)

        if count > 0:
            reason = f"Active high-density scheduled public events ({count} registered) may cause transit delays."
        else:
            reason = "No major scheduled public events or festivals logged nearby."

        return {
            "risk_score": risk_score,
            "confidence": 1.0,
            "reason": reason,
            "metadata": {
                "events_count": count
            }
        }
