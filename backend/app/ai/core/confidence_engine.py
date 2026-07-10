from typing import Dict, Any
from sqlalchemy.orm import Session

from app.models.street_light import StreetLight
from app.models.cctv_camera import CCTVCamera
from app.models.crime_record import CrimeRecord
from app.utils.spatial import query_within_radius

class ConfidenceEngine:
    def __init__(self, radius_meters: float = 500.0, target_density: int = 5):
        self.name = "Confidence Engine"
        self.radius_meters = radius_meters
        self.target_density = target_density

    def evaluate(self, db: Session, lat: float, lng: float) -> Dict[str, Any]:
        """Calculates data confidence score based on telemetry point density in the region."""
        # Query datasets within 500m to determine density
        lights = query_within_radius(db, StreetLight, lat, lng, self.radius_meters)
        cctvs = query_within_radius(db, CCTVCamera, lat, lng, self.radius_meters)
        crimes = query_within_radius(db, CrimeRecord, lat, lng, self.radius_meters)

        total_points = len(lights) + len(cctvs) + len(crimes)

        # Scale confidence: target_density or more points = 100% confidence
        if self.target_density > 0:
            confidence_pct = min(100.0, (total_points / self.target_density) * 100.0)
        else:
            confidence_pct = 100.0

        confidence_pct = round(confidence_pct, 2)

        if confidence_pct >= 80.0:
            level = "High"
        elif confidence_pct >= 50.0:
            level = "Medium"
        else:
            level = "Low"

        reasons = [f"Confidence: {confidence_pct}% ({level} Data Reliability based on {total_points} regional points)."]

        return {
            "confidence_percentage": confidence_pct,
            "confidence_level": level,
            "total_telemetry_points": total_points,
            "reasons": reasons,
            "metadata": {
                "radius_meters": self.radius_meters,
                "lights_count": len(lights),
                "cctvs_count": len(cctvs),
                "crimes_count": len(crimes)
            }
        }
