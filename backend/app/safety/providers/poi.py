import time
import math
from app.safety.providers.base import BaseSafetyProvider

class POIProvider(BaseSafetyProvider):
    def __init__(self):
        super().__init__("POI Provider")

    async def fetch_data(self, lat: float, lng: float) -> dict:
        """Generates list coordinates representing nearby Police, Medical, Pharmacy and Safe places."""
        start_time = time.time()
        try:
            # Deterministic POI locations offset by sine metrics
            police_stations = [
                {
                    "name": "Metropolitan Police HQ",
                    "address": "45 Civic Plaza",
                    "lat": lat + 0.005,
                    "lng": lng - 0.003,
                    "phone": "+15559110022"
                }
            ]

            hospitals = [
                {
                    "name": "General City Hospital",
                    "address": "12 Healthcare Way",
                    "lat": lat - 0.008,
                    "lng": lng + 0.006,
                    "phone": "+15554670000"
                }
            ]

            pharmacies = [
                {
                    "name": "Care Pharmacy 24/7",
                    "address": "88 Commerce St",
                    "lat": lat + 0.002,
                    "lng": lng + 0.002,
                    "phone": "+15558981200"
                }
            ]

            safe_places = [
                {
                    "name": "24h Open Supermarket",
                    "address": "10 Central Blvd",
                    "lat": lat - 0.001,
                    "lng": lng - 0.001,
                    "phone": None
                }
            ]

            self.record_success((time.time() - start_time) * 1000)
            return {
                "police_stations": police_stations,
                "hospitals": hospitals,
                "pharmacies": pharmacies,
                "safe_places": safe_places
            }
        except Exception:
            self.record_failure()
            raise
