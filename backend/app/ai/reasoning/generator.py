from typing import List, Dict, Any

class ReasonGenerator:
    @staticmethod
    def generate_reasons(module_results: Dict[str, Dict[str, Any]]) -> List[str]:
        """Consolidates risk module evaluation logs into clean explanation bullet points."""
        reasons = []
        
        # Priority sort: Warnings first, then safety positive attributes
        warnings = []
        safeties = []

        for name, res in module_results.items():
            score = res.get("risk_score", 0.0)
            reason = res.get("reason", "")
            if not reason:
                continue

            if score > 30.0:
                warnings.append(reason)
            elif score <= 0.0 or "Excellent" in reason or "mitigate" in reason:
                safeties.append(reason)
            else:
                # Neutral moderate inputs
                safeties.append(reason)

        # Merge results prioritizing alerts/warnings
        reasons.extend(warnings)
        reasons.extend(safeties)
        
        if not reasons:
            reasons.append("Transit conditions are standard with moderate safety parameters.")
            
        return reasons
