from abc import ABC, abstractmethod
from datetime import datetime, timezone
from app.safety.schemas.schemas import ProviderHealth

class BaseSafetyProvider(ABC):
    def __init__(self, name: str):
        self.name = name
        self.status = "healthy"
        self.availability = 100.0
        self.last_update = datetime.now(timezone.utc)
        self.latency_ms = 0.0
        self.total_requests = 0
        self.failed_requests = 0

    @abstractmethod
    async def fetch_data(self, lat: float, lng: float) -> dict:
        """Fetch and return normalized data from safety provider."""
        pass

    def record_success(self, duration_ms: float):
        """Update latency and requests counts on successful lookup."""
        self.total_requests += 1
        self.latency_ms = (self.latency_ms * 0.9) + (duration_ms * 0.1)  # Exponential moving average
        self.status = "healthy"
        self.availability = ((self.total_requests - self.failed_requests) / self.total_requests) * 100.0
        self.last_update = datetime.now(timezone.utc)

    def record_failure(self):
        """Update failure statuses and request metrics."""
        self.total_requests += 1
        self.failed_requests += 1
        self.status = "degraded"
        self.availability = ((self.total_requests - self.failed_requests) / self.total_requests) * 100.0
        self.last_update = datetime.now(timezone.utc)

    def get_health(self) -> ProviderHealth:
        """Returns standard serialization health model details."""
        return ProviderHealth(
            name=self.name,
            status=self.status,
            availability=self.availability,
            latency_ms=round(self.latency_ms, 2),
            last_update=self.last_update
        )
