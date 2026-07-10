from typing import Dict, Any

class RiskAggregator:
    def __init__(self):
        self.name = "Risk Aggregator"

    def aggregate(
        self, 
        crime_result: Dict[str, Any], 
        infra_result: Dict[str, Any], 
        time_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Combines risk values from Crime and Infrastructure, applying Time modifiers."""
        crime_mult = time_result.get("crime_multiplier", 1.0)
        infra_mult = time_result.get("infrastructure_multiplier", 1.0)

        raw_crime_risk = crime_result.get("crime_risk", 0.0)
        raw_infra_risk = infra_result.get("infrastructure_risk", 0.0)

        adjusted_crime_risk = raw_crime_risk * crime_mult
        adjusted_infra_risk = raw_infra_risk * infra_mult

        total_accumulated_risk = adjusted_crime_risk + adjusted_infra_risk

        return {
            "total_accumulated_risk": round(total_accumulated_risk, 2),
            "adjusted_crime_risk": round(adjusted_crime_risk, 2),
            "adjusted_infra_risk": round(adjusted_infra_risk, 2),
            "crime_multiplier_applied": crime_mult,
            "infrastructure_multiplier_applied": infra_mult
        }
