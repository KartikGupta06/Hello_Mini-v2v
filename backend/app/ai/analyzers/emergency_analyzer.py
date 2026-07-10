from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.police_station import PoliceStation
from app.models.hospital import Hospital
from app.utils.spatial import haversine_distance

class EmergencyAnalyzer:
    def __init__(self):
        self.name = "Emergency Analyzer"

    def evaluate(self, db: Session, lat: float, lng: float) -> Dict[str, Any]:
        """Calculates distance to nearest police station and hospital, outputting emergency readiness metrics."""
        # 1. Query all police stations and find nearest
        police_stations = db.query(PoliceStation).all()
        nearest_police_dist = float('inf')
        nearest_police_name = "Unknown"

        for ps in police_stations:
            dist = haversine_distance(lat, lng, ps.latitude, ps.longitude)
            if dist < nearest_police_dist:
                nearest_police_dist = dist
                nearest_police_name = ps.station_name

        # 2. Query all hospitals and find nearest
        hospitals = db.query(Hospital).all()
        nearest_hospital_dist = float('inf')
        nearest_hospital_name = "Unknown"

        for hosp in hospitals:
            dist = haversine_distance(lat, lng, hosp.latitude, hosp.longitude)
            if dist < nearest_hospital_dist:
                nearest_hospital_dist = dist
                nearest_hospital_name = hosp.hospital_name

        # 3. Calculate Normalized Emergency Readiness Score (0 to 100)
        police_score = 0.0
        if nearest_police_dist < 500:
            police_score = 60.0
            police_text = "within 500m (Immediate access)"
        elif nearest_police_dist < 1500:
            police_score = 40.0
            police_text = "within 1.5km (Quick access)"
        elif nearest_police_dist < 3000:
            police_score = 20.0
            police_text = "within 3.0km (Moderate access)"
        else:
            police_score = 0.0
            police_text = "over 3.0km away (Delayed access)"

        hospital_score = 0.0
        if nearest_hospital_dist < 1000:
            hospital_score = 40.0
            hospital_text = "within 1km (Immediate access)"
        elif nearest_hospital_dist < 3000:
            hospital_score = 20.0
            hospital_text = "within 3km (Moderate access)"
        else:
            hospital_score = 0.0
            hospital_text = "over 3km away (Delayed access)"

        readiness_score = police_score + hospital_score

        if readiness_score >= 80:
            readiness_level = "High"
        elif readiness_score >= 40:
            readiness_level = "Moderate"
        else:
            readiness_level = "Isolated"

        # Generate reasons
        reasons = []
        reasons.append(f"Nearest Police Station: {nearest_police_name} is {police_text}.")
        reasons.append(f"Nearest Hospital: {nearest_hospital_name} is {hospital_text}.")

        return {
            "emergency_readiness_score": readiness_score,
            "readiness_level": readiness_level,
            "nearest_police_distance_m": round(nearest_police_dist, 1) if nearest_police_dist != float('inf') else None,
            "nearest_police_name": nearest_police_name,
            "nearest_hospital_distance_m": round(nearest_hospital_dist, 1) if nearest_hospital_dist != float('inf') else None,
            "nearest_hospital_name": nearest_hospital_name,
            "reasons": reasons,
            "metadata": {}
        }
