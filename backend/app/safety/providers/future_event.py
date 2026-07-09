import time
import math
from datetime import datetime, timedelta, timezone
from app.safety.providers.base import BaseSafetyProvider

class FutureEventProvider(BaseSafetyProvider):
    def __init__(self):
        super().__init__("Future Event Provider")

    async def fetch_data(self, lat: float, lng: float) -> dict:
        """Deterministically registers mock future events nearby coordinates."""
        start_time = time.time()
        try:
            val = math.sin(lat + lng)
            events = []
            
            # Seed event deterministically
            if val > 0.4:
                events.append({
                    "title": "Local Street Food Fair",
                    "description": "Public community gathering with high foot traffic.",
                    "scheduled_time": datetime.now(timezone.utc) + timedelta(hours=3)
                })
            elif val < -0.4:
                events.append({
                    "title": "Starlight Marathon",
                    "description": "Active public running marathon with traffic diversions.",
                    "scheduled_time": datetime.now(timezone.utc) + timedelta(hours=6)
                })

            self.record_success((time.time() - start_time) * 1000)
            return {
                "events_count": len(events),
                "events": events
            }
        except Exception:
            self.record_failure()
            raise
