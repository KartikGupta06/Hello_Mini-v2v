from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.street_light import StreetLight
from app.models.cctv_camera import CCTVCamera
from app.utils.spatial import query_within_radius

class InfrastructureAnalyzer:
    def __init__(self, radius_meters: float = 300.0):
        self.name = "Infrastructure Analyzer"
        self.radius_meters = radius_meters

    def evaluate(self, db: Session, lat: float, lng: float) -> Dict[str, Any]:
        """Evaluates infrastructure status (street lights, CCTV) and returns infrastructure risk score."""
        # Query lights and cameras within 300m
        lights_with_dist = query_within_radius(db, StreetLight, lat, lng, self.radius_meters)
        cctvs_with_dist = query_within_radius(db, CCTVCamera, lat, lng, self.radius_meters)

        working_lights = 0
        faulty_lights = 0
        working_cctvs = 0
        faulty_cctvs = 0

        for light, _ in lights_with_dist:
            if light.light_status == "Working":
                working_lights += 1
            else:
                faulty_lights += 1

        for cctv, _ in cctvs_with_dist:
            if cctv.camera_status == "Working":
                working_cctvs += 1
            else:
                faulty_cctvs += 1

        # 1. Calculate Street Light Risk
        light_risk = 0.0
        # Faulty lights accumulate risk points
        light_risk += faulty_lights * 6.0
        # Dark zone baseline penalty if no working lights exist
        if working_lights == 0:
            light_risk += 15.0

        # 2. Calculate CCTV Risk
        cctv_risk = 0.0
        # Faulty cameras accumulate risk points
        cctv_risk += faulty_cctvs * 4.0
        # Lack of surveillance baseline penalty
        if working_cctvs == 0:
            cctv_risk += 10.0

        total_infrastructure_risk = light_risk + cctv_risk

        # Generate reasons
        reasons = []
        if working_lights > 0:
            reasons.append(f"Detected {working_lights} working street light(s) within {int(self.radius_meters)}m.")
        if faulty_lights > 0:
            reasons.append(f"Warning: {faulty_lights} faulty street light(s) detected nearby (causing dark spots).")
        if working_lights == 0:
            reasons.append("Warning: Sector lacks active street lighting (dark zone).")

        if working_cctvs > 0:
            reasons.append(f"Detected {working_cctvs} active CCTV surveillance camera(s) nearby.")
        if faulty_cctvs > 0:
            reasons.append(f"Warning: {faulty_cctvs} inactive/faulty CCTV camera(s) detected.")
        if working_cctvs == 0:
            reasons.append("Warning: Sector lacks active CCTV surveillance coverage.")

        return {
            "infrastructure_risk": round(total_infrastructure_risk, 2),
            "working_lights_count": working_lights,
            "faulty_lights_count": faulty_lights,
            "working_cctvs_count": working_cctvs,
            "faulty_cctvs_count": faulty_cctvs,
            "reasons": reasons,
            "metadata": {
                "radius_meters": self.radius_meters,
                "street_lights_found": len(lights_with_dist),
                "cctv_cameras_found": len(cctvs_with_dist)
            }
        }
