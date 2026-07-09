# Safety Intelligence Data Layer

This module provides the central Safety Data Aggregation Layer for **SafeRoute AI**. It gathers safety-related indicators (historical crime reports, street lighting densities, active community reports, weather conditions, proximity to points of interest (POIs), temporal context, and future public events) concurrently, normalizes the outputs, caches combined responses, and serves health indices.

## Directory Structure
```
backend/app/safety/
├── aggregator/
│   └── aggregator.py       # Core aggregator orchestrating concurrent data collection
├── api/
│   └── router.py           # REST API endpoints (/safety/aggregate, /safety/health)
├── cache/
│   └── cache.py            # Thread-safe in-memory cache with key-level TTLs
├── providers/
│   ├── __init__.py         # Exposes all active providers
│   ├── base.py             # Base abstract Safety Provider interface
│   ├── crime.py            # Crime statistics provider
│   ├── lighting.py         # Street lighting density quality provider
│   ├── community.py        # Queries backend CommunityReports DB tables directly
│   ├── weather.py          # Weather and visibility metrics provider
│   ├── poi.py              # Police Station, Pharmacy, Hospital, and Safe Places POIs provider
│   ├── time_context.py     # Temporal conditions (night, hour, day) provider
│   └── future_event.py     # Scheduled public events provider
└── schemas/
    └── schemas.py          # Pydantic schemas validating inputs and normalizations
```

---

## 1. Provider Architecture
All providers derive from [BaseSafetyProvider](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/safety/providers/base.py):
*   **Properties tracked automatically:**
    *   `status`: Provider health status (`healthy`, `degraded`).
    *   `availability`: Percentage score representing success ratios (e.g. `100.0%`).
    *   `latency_ms`: Exponential moving average of lookup durations in milliseconds.
    *   `last_update`: Timestamp of last executed query.
*   **Data retrieval:** Each provider overrides the asynchronous method `async def fetch_data(self, lat: float, lng: float) -> dict` returning normalized data models.

---

## 2. Aggregator Workflow
The [SafetyAggregator](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/safety/aggregator/aggregator.py) coordinates lookups:
1.  **Cache Lookup**: Calculates rounded coordinate values (rounded to 4 decimal places, which limits spatial queries to approximately 11-meter precision blocks). If a cache hit is found and is unexpired, it returns instantly.
2.  **Concurrent Execution**: Loops through registered providers, scheduling them concurrently using `asyncio.gather`.
3.  **Timeout Limits**: Enforces a strict timeout boundary (default 2.0 seconds) per provider lookup using `asyncio.wait_for`.
4.  **Graceful Degradation**: If a provider fails (raises exceptions or times out), the aggregator catches it, logs the warning details, sets the provider status to `degraded`, and falls back to a category-specific default dictionary value. **The system never crashes due to downstream provider failures.**
5.  **Standardization**: Returns a unified [SafetyAggregateResponse](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/safety/schemas/schemas.py) object, saves it to the cache with key TTL parameters, and logs hit/miss counts.

---

## 3. Caching & TTL Engine
*   **SafetyCache**: Thread-safe in-memory cache managed by `threading.Lock`.
*   **TTL Invalidation**: Expired records are deleted dynamically upon query attempts or manual clear. Cache stats track hits and misses.

---

## 4. API & Health Endpoints
*   `GET /api/v1/safety/aggregate?lat=X&lng=Y`: Returns normalized, aggregated safety parameters.
*   `GET /api/v1/safety/health`: Lists details of active providers, latencies, availability, and statuses.

---

## 5. Adding New Providers

Adding a new safety provider is extremely modular. Follow these steps:

### Step A: Define the Provider Class
Create a new file under `providers/` (e.g. `providers/crowd_density.py`) inheriting from `BaseSafetyProvider`:
```python
import time
from app.safety.providers.base import BaseSafetyProvider

class CrowdDensityProvider(BaseSafetyProvider):
    def __init__(self):
        super().__init__("Crowd Density Provider")

    async def fetch_data(self, lat: float, lng: float) -> dict:
        start_time = time.time()
        try:
            # Implement custom retrieval logic (e.g. HTTP call to external API)
            result = {"density_level": "medium", "description": "Normal pedestrian activity."}
            self.record_success((time.time() - start_time) * 1000)
            return result
        except Exception:
            self.record_failure()
            raise
```

### Step B: Define Fallbacks inside Aggregator
Inside [SafetyAggregator._get_fallback_for_provider()](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/safety/aggregator/aggregator.py), define the default return dictionary:
```python
        elif isinstance(provider, CrowdDensityProvider):
            return {
                "density_level": "low",
                "description": "Crowd density metrics temporarily offline."
            }
```

### Step C: Register the Provider
Import and append the new provider inside the `SafetyAggregator` constructor list or include it in `providers/__init__.py`.
