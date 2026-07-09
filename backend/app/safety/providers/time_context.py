import time
from datetime import datetime, timezone
from app.safety.providers.base import BaseSafetyProvider

class TimeContextProvider(BaseSafetyProvider):
    def __init__(self):
        super().__init__("Time Context Provider")

    async def fetch_data(self, lat: float, lng: float) -> dict:
        """Parses UTC datetime metrics returning temporal context fields."""
        start_time = time.time()
        try:
            now = datetime.now(timezone.utc)
            hour = now.hour
            is_night = hour < 6 or hour > 19
            weekday = now.strftime("%A")

            self.record_success((time.time() - start_time) * 1000)
            return {
                "hour": hour,
                "is_night": is_night,
                "weekday": weekday
            }
        except Exception:
            self.record_failure()
            raise
