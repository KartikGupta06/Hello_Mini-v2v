from typing import Dict, Any

class RiskAggregator:
    def __init__(self):
        self.name = "Risk Aggregator"

    def aggregate(
        self, 
        crime_result: Dict[str, Any], 
        infra_result: Dict[str, Any], 
        time_result: Dict[str, Any],
        emergency_result: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Combines risk values from Crime and Infrastructure, applying Time and Emergency modifiers."""
        crime_mult = time_result.get("crime_multiplier", 1.0)
        infra_mult = time_result.get("infrastructure_multiplier", 1.0)

        raw_crime_risk = crime_result.get("crime_risk", 0.0)
        raw_infra_risk = infra_result.get("infrastructure_risk", 0.0)

        adjusted_crime_risk = raw_crime_risk * crime_mult
        adjusted_infra_risk = raw_infra_risk * infra_mult

        total_accumulated_risk = adjusted_crime_risk + adjusted_infra_risk

        # Apply Emergency Readiness Mitigation (max 20 points reduced)
        emergency_mitigation = 0.0
        if emergency_result:
            readiness = emergency_result.get("emergency_readiness_score", 0.0)
            # Offset up to 20 penalty points if readiness is 100
            mitigation_factor = (readiness / 100.0) * 20.0
            # Ensure mitigation doesn't wipe out more than 60% of the total risk
            emergency_mitigation = min(total_accumulated_risk * 0.6, mitigation_factor)
            total_accumulated_risk -= emergency_mitigation
            total_accumulated_risk = max(0.0, total_accumulated_risk)

        return {
            "total_accumulated_risk": round(total_accumulated_risk, 2),
            "adjusted_crime_risk": round(adjusted_crime_risk, 2),
            "adjusted_infra_risk": round(adjusted_infra_risk, 2),
            "emergency_mitigation": round(emergency_mitigation, 2),
            "crime_multiplier_applied": crime_mult,
            "infrastructure_multiplier_applied": infra_mult
        }
