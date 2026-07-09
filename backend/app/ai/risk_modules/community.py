from app.ai.risk_modules.base import BaseRiskModule

class CommunityRiskModule(BaseRiskModule):
    def __init__(self):
        super().__init__("Community Risk")

    def evaluate(self, data: dict) -> dict:
        """Evaluates active community reports returning risk scores and explanation reasons."""
        community_data = data.get("community", {})
        count = community_data.get("active_reports_count", 0)

        # Scale risk based on active reports count (capped at 100.0)
        risk_score = min(count * 20.0, 100.0)

        if count > 0:
            reason = f"Has {count} active hazard reports submitted recently by the community."
        else:
            reason = "No active community reports logged in this coordinate sector."

        return {
            "risk_score": risk_score,
            "confidence": 1.0,
            "reason": reason,
            "metadata": {
                "active_reports_count": count
            }
        }
