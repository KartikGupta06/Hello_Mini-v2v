from app.ai.risk_modules.base import BaseRiskModule

class POIRiskModule(BaseRiskModule):
    def __init__(self):
        super().__init__("POI Risk")

    def evaluate(self, data: dict) -> dict:
        """Evaluates emergency infrastructure coordinates calculating risk mitigation discount factors."""
        poi_data = data.get("poi", {})
        police = poi_data.get("police_stations", [])
        hospitals = poi_data.get("hospitals", [])
        pharmacies = poi_data.get("pharmacies", [])
        safe_places = poi_data.get("safe_places", [])

        # Calculate mitigation sum
        mitigation = 0.0
        mitigation += len(police) * 10.0
        mitigation += len(safe_places) * 5.0
        mitigation += (len(hospitals) + len(pharmacies)) * 2.0

        if mitigation > 0:
            reason = "Proximity to emergency infrastructure (police stations, safe havens) mitigates ambient risks."
        else:
            reason = "Deficient emergency infrastructure observed within immediate bounds."

        return {
            # Returned as negative score to represent discount mitigation
            "risk_score": -mitigation,
            "confidence": 1.0,
            "reason": reason,
            "metadata": {
                "police_count": len(police),
                "hospitals_count": len(hospitals),
                "pharmacies_count": len(pharmacies),
                "safe_places_count": len(safe_places)
            }
        }
