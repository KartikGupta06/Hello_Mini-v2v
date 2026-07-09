import time
import math
from app.safety.providers.base import BaseSafetyProvider

class WeatherProvider(BaseSafetyProvider):
    def __init__(self):
        super().__init__("Weather Provider")

    async def fetch_data(self, lat: float, lng: float) -> dict:
        """Deterministically generates weather parameters based on coordinates."""
        start_time = time.time()
        try:
            val = math.sin(lat * lng)
            if val > 0.4:
                condition = "rain"
                visibility = 3000.0
            elif val < -0.4:
                condition = "fog"
                visibility = 800.0
            else:
                condition = "clear"
                visibility = 10000.0

            # Deterministic temperature
            temp = 18.0 + 10.0 * math.sin(lat)

            self.record_success((time.time() - start_time) * 1000)
            return {
                "visibility_meters": visibility,
                "condition": condition,
                "temperature_c": round(temp, 1)
            }
        except Exception:
            self.record_failure()
            raise
