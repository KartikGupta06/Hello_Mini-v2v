import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.safety.providers import (
    BaseSafetyProvider,
    CrimeProvider,
    StreetLightingProvider,
    CommunityReportsProvider,
    WeatherProvider,
    POIProvider,
    TimeContextProvider,
    FutureEventProvider,
)
from app.safety.schemas.schemas import SafetyAggregateResponse, CoordinateLocation
from app.safety.cache.cache import safety_cache

logger = logging.getLogger("safety_aggregator")

class SafetyAggregator:
    def __init__(self, providers: Optional[List[BaseSafetyProvider]] = None):
        """Manages execution of safety data providers concurrently, managing health logs."""
        if providers is not None:
            self.providers = providers
        else:
            self.providers = [
                CrimeProvider(),
                StreetLightingProvider(),
                CommunityReportsProvider(),
                WeatherProvider(),
                POIProvider(),
                TimeContextProvider(),
                FutureEventProvider()
            ]

    def validate_coordinates(self, lat: float, lng: float) -> None:
        """Validates that latitude and longitude coordinates fall within geographical bounds."""
        if not (-90.0 <= lat <= 90.0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Latitude {lat} falls outside boundary range [-90, 90]"
            )
        if not (-180.0 <= lng <= 180.0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Longitude {lng} falls outside boundary range [-180, 180]"
            )

    async def aggregate(
        self, 
        lat: float, 
        lng: float, 
        db: Session = None, 
        use_cache: bool = True
    ) -> SafetyAggregateResponse:
        """Runs provider lookups concurrently with graceful fallbacks and caching."""
        self.validate_coordinates(lat, lng)

        # Check Cache
        if use_cache:
            cached_data = safety_cache.get(lat, lng)
            if cached_data:
                return cached_data

        # Concurrently lookup providers
        tasks = []
        for provider in self.providers:
            tasks.append(self._fetch_provider_safely(provider, lat, lng, db))

        results = await asyncio.gather(*tasks)
        
        # Parse into combined structure
        aggregate_dict = {
            "location": CoordinateLocation(lat=lat, lng=lng),
            "timestamp": datetime.now(timezone.utc),
            "crime": results[0],
            "lighting": results[1],
            "community": results[2],
            "weather": results[3],
            "poi": results[4],
            "time": results[5],
            "future_event": results[6],
            "metadata": {
                "cache_hits": safety_cache.hits,
                "cache_misses": safety_cache.misses,
                "provider_statuses": {p.name: p.status for p in self.providers}
            }
        }
        
        response = SafetyAggregateResponse(**aggregate_dict)
        
        # Save to Cache
        if use_cache:
            safety_cache.set(lat, lng, response)
            
        return response

    async def _fetch_provider_safely(
        self, 
        provider: BaseSafetyProvider, 
        lat: float, 
        lng: float, 
        db: Session = None,
        timeout: float = 2.0
    ) -> Dict[str, Any]:
        """Runs individual provider lookups wrapped in exception logs and timeouts."""
        start_time = time.time()
        try:
            # Handle community DB session dependency injections
            if isinstance(provider, CommunityReportsProvider):
                coro = provider.fetch_data(lat, lng, db)
            else:
                coro = provider.fetch_data(lat, lng)

            # Wait with strict timeout limits
            data = await asyncio.wait_for(coro, timeout=timeout)
            return data
            
        except asyncio.TimeoutError:
            logger.error(f"Provider {provider.name} lookup timed out after {timeout} seconds.")
            provider.record_failure()
            return self._get_fallback_for_provider(provider)
        except Exception as e:
            logger.error(f"Provider {provider.name} failed during lookup: {str(e)}", exc_info=True)
            provider.record_failure()
            return self._get_fallback_for_provider(provider)

    def _get_fallback_for_provider(self, provider: BaseSafetyProvider) -> Dict[str, Any]:
        """Provides default values when a provider fails to avoid crashing."""
        if isinstance(provider, CrimeProvider):
            return {
                "incident_count": 0,
                "risk_level": "low",
                "description": "Historical crime statistics temporarily offline."
            }
        elif isinstance(provider, StreetLightingProvider):
            return {
                "lighting_level": "moderate",
                "lamps_count": 0,
                "description": "Street lighting metrics temporarily offline."
            }
        elif isinstance(provider, CommunityReportsProvider):
            return {
                "active_reports_count": 0,
                "reports": []
            }
        elif isinstance(provider, WeatherProvider):
            return {
                "visibility_meters": 10000.0,
                "condition": "clear",
                "temperature_c": 20.0
            }
        elif isinstance(provider, POIProvider):
            return {
                "police_stations": [],
                "hospitals": [],
                "pharmacies": [],
                "safe_places": []
            }
        elif isinstance(provider, TimeContextProvider):
            now = datetime.now(timezone.utc)
            return {
                "hour": now.hour,
                "is_night": now.hour < 6 or now.hour > 19,
                "weekday": now.strftime("%A")
            }
        elif isinstance(provider, FutureEventProvider):
            return {
                "events_count": 0,
                "events": []
            }
        return {}

    def get_providers_health(self) -> List[Dict[str, Any]]:
        """Returns standard serialized list details of active providers."""
        return [p.get_health().model_dump() for p in self.providers]

# Global instance
safety_aggregator = SafetyAggregator()
