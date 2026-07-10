from typing import Dict, Any, List

class ExplanationGenerator:
    def __init__(self):
        self.name = "Explanation Generator"

    def generate(
        self, 
        crime_result: Dict[str, Any], 
        infra_result: Dict[str, Any], 
        emergency_result: Dict[str, Any], 
        time_result: Dict[str, Any],
        confidence_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Translates numerical safety analysis breakdowns into clear, positive and negative explanations."""
        why_this_route = []
        risks_and_warnings = []

        # 1. Crime Explanations
        crime_count = crime_result.get("incident_count", 0)
        if crime_count == 0:
            why_this_route.append("✔ No recent historical crime incidents detected.")
        else:
            risks_and_warnings.append(f"• {crime_count} historical crime incident(s) detected within 500m.")

        # 2. Infrastructure Explanations
        working_lights = infra_result.get("working_lights_count", 0)
        faulty_lights = infra_result.get("faulty_lights_count", 0)
        working_cctvs = infra_result.get("working_cctvs_count", 0)
        faulty_cctvs = infra_result.get("faulty_cctvs_count", 0)

        if working_lights > 0:
            why_this_route.append(f"✔ {working_lights} working street light(s) detected nearby.")
        if working_lights == 0:
            risks_and_warnings.append("• Sector lacks active street lighting (dark zone).")
        if faulty_lights > 0:
            risks_and_warnings.append(f"• {faulty_lights} faulty street light(s) causing dark spots.")

        if working_cctvs > 0:
            why_this_route.append(f"✔ {working_cctvs} active CCTV camera(s) providing surveillance.")
        if working_cctvs == 0:
            risks_and_warnings.append("• Sector lacks active CCTV surveillance coverage.")
        if faulty_cctvs > 0:
            risks_and_warnings.append(f"• {faulty_cctvs} inactive/faulty CCTV camera(s) detected.")

        # 3. Emergency Accessibility Explanations
        readiness_lvl = emergency_result.get("readiness_level", "Moderate")
        police_name = emergency_result.get("nearest_police_name", "Local Station")
        hospital_name = emergency_result.get("nearest_hospital_name", "Local Hospital")

        if readiness_lvl == "High":
            why_this_route.append(f"✔ High emergency readiness (Police Station: {police_name}, Hospital: {hospital_name}).")
        elif readiness_lvl == "Moderate":
            why_this_route.append("✔ Moderate emergency response accessibility within standard range.")
        else:
            risks_and_warnings.append("• Isolated sector with delayed emergency response accessibility.")

        # 4. Time Modifier Explanations
        window = time_result.get("time_window", "Morning")
        if window == "Night":
            risks_and_warnings.append("• Night-time travel amplifies minor baseline and infrastructure risks.")
        elif window == "Evening":
            risks_and_warnings.append("• Evening travel increases the significance of active lighting infrastructure.")

        # 5. Confidence Warnings
        conf_lvl = confidence_result.get("confidence_level", "High")
        if conf_lvl == "Low":
            risks_and_warnings.append("• Warning: Low telemetry data density (reliability of safety estimate is reduced).")

        return {
            "why_this_route": why_this_route,
            "risks_and_warnings": risks_and_warnings
        }
