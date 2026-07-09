import time
import math
from app.safety.providers.base import BaseSafetyProvider

class StreetLightingProvider(BaseSafetyProvider):
    def __init__(self):
        super().__init__("Street Lighting Provider")

    async def fetch_data(self, lat: float, lng: float) -> dict:
        """Deterministically generates mock street lighting quality based on coordinates."""
        start_time = time.time()
        try:
            val = math.cos(lat) * math.sin(lng)
            if val > 0.3:
                level = "excellent"
                lamps = 35
                desc = "High density of active modern street lighting."
            elif val < -0.3:
                level = "poor"
                lamps = 3
                desc = "Isolated zone with highly deficient active light fixtures."
            else:
                level = "moderate"
                lamps = 14
                desc = "Standard commercial zone street lighting coverage."

            self.record_success((time.time() - start_time) * 1000)
            return {
                "lighting_level": level,
                "lamps_count": lamps,
                "description": desc
            }
        except Exception:
            self.record_failure()
            raise
