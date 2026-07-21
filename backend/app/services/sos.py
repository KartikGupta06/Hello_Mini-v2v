from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.police_station import PoliceStation
from app.models.hospital import Hospital
from app.models.sos_event import SOSEvent
from app.utils.spatial import query_within_radius

class SOSService:
    @staticmethod
    def create_sos_event(db: Session, user_id: int, latitude: Optional[float], longitude: Optional[float]) -> SOSEvent:
        event = SOSEvent(
            user_id=user_id,
            latitude=latitude,
            longitude=longitude,
            status="ACTIVE"
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def find_nearest_services(
        db: Session, 
        latitude: Optional[float], 
        longitude: Optional[float]
    ) -> Dict[str, Any]:
        # If GPS is completely missing, return a safe fallback message
        if latitude is None or longitude is None:
            return {
                "sos_status": "active",
                "current_location": {
                    "latitude": None,
                    "longitude": None
                },
                "nearest_police": None,
                "nearest_hospital": None,
                "nearby_police_stations": [],
                "nearby_hospitals": [],
                "message": "SOS active, but GPS location is unavailable."
            }

        # Validate coordinates ranges
        if not (-90.0 <= latitude <= 90.0):
            raise ValueError("Latitude must be between -90 and 90.")
        if not (-180.0 <= longitude <= 180.0):
            raise ValueError("Longitude must be between -180 and 180.")

        # Find nearest police stations (expand radius from 5km up to 100km if not found)
        police_results = []
        for radius in [5000.0, 15000.0, 50000.0, 100000.0]:
            police_results = query_within_radius(db, PoliceStation, latitude, longitude, radius)
            if police_results:
                break
        
        # Find nearest hospitals
        hospital_results = []
        for radius in [5000.0, 15000.0, 50000.0, 100000.0]:
            hospital_results = query_within_radius(db, Hospital, latitude, longitude, radius)
            if hospital_results:
                break

        # Sort by distance
        police_results.sort(key=lambda x: x[1])
        hospital_results.sort(key=lambda x: x[1])

        nearest_police = None
        if police_results:
            ps, dist = police_results[0]
            nearest_police = {
                "name": ps.station_name,
                "distance_m": round(dist, 2),
                "latitude": ps.latitude,
                "longitude": ps.longitude,
                "address": ps.address,
                "contact_number": ps.contact_number
            }

        nearest_hospital = None
        if hospital_results:
            hp, dist = hospital_results[0]
            nearest_hospital = {
                "name": hp.hospital_name,
                "distance_m": round(dist, 2),
                "latitude": hp.latitude,
                "longitude": hp.longitude,
                "address": hp.address,
                "contact_number": hp.contact_number
            }

        # Build nearby lists for Extra Recommendation 2
        nearby_police = [
            {
                "name": ps.station_name,
                "distance_m": round(dist, 2),
                "latitude": ps.latitude,
                "longitude": ps.longitude
            } for ps, dist in police_results[1:5]
        ]

        nearby_hospitals = [
            {
                "name": hp.hospital_name,
                "distance_m": round(dist, 2),
                "latitude": hp.latitude,
                "longitude": hp.longitude
            } for hp, dist in hospital_results[1:5]
        ]

        # Determine message
        if nearest_police or nearest_hospital:
            message = "Nearest emergency services located successfully."
        else:
            message = "No emergency services found within 100km."

        return {
            "sos_status": "active",
            "current_location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "nearest_police": nearest_police,
            "nearest_hospital": nearest_hospital,
            "nearby_police_stations": nearby_police,
            "nearby_hospitals": nearby_hospitals,
            "message": message
        }
