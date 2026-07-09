import time
import math
from app.safety.providers.base import BaseSafetyProvider

class CrimeProvider(BaseSafetyProvider):
    def __init__(self):
        super().__init__("Crime Provider")

    async def fetch_data(self, lat: float, lng: float) -> dict:
        """Deterministically generates mock crime metrics based on coordinates."""
        start_time = time.time()
        try:
            val = math.sin(lat) + math.cos(lng)
            if val > 0.5:
                risk = "high"
                count = 12
                desc = "Elevated historical crime reports logged within 500m."
            elif val < -0.5:
                risk = "low"
                count = 1
                desc = "Extremely low historical crime records."
            else:
                risk = "medium"
                count = 5
                desc = "Moderate historical incidents logged."

            self.record_success((time.time() - start_time) * 1000)
            return {
                "incident_count": count,
                "risk_level": risk,
                "description": desc
            }
        except Exception:
            self.record_failure()
            raise
