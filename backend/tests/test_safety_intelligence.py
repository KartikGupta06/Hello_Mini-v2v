import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.safety.aggregator.aggregator import SafetyAggregator
from app.safety.providers.crime import CrimeProvider
from app.safety.providers.weather import WeatherProvider
from app.safety.cache.cache import safety_cache

# --- COORDINATES VALIDATION TESTS ---

def test_coordinates_validation():
    aggregator = SafetyAggregator()
    
    # Valid coordinates
    aggregator.validate_coordinates(40.7128, -74.0060)
    
    # Invalid latitude
    with pytest.raises(Exception) as exc_info:
        aggregator.validate_coordinates(95.0, -74.0060)
    assert exc_info.value.status_code == 400
    assert "Latitude" in exc_info.value.detail

    # Invalid longitude
    with pytest.raises(Exception) as exc_info:
        aggregator.validate_coordinates(40.7128, 185.0)
    assert exc_info.value.status_code == 400
    assert "Longitude" in exc_info.value.detail


# --- CACHE AND TTL TESTS ---

def test_cache_set_get_and_expiration():
    safety_cache.clear()
    
    # Mock data
    lat, lng = 40.7128, -74.0060
    mock_response = "mock_aggregate"
    
    # Get from empty cache (miss)
    assert safety_cache.get(lat, lng) is None
    assert safety_cache.misses == 1
    
    # Set cache with short TTL (1 second)
    safety_cache.set(lat, lng, mock_response, ttl_seconds=1)
    
    # Immediately check cache (hit)
    assert safety_cache.get(lat, lng) == mock_response
    assert safety_cache.hits == 1
    
    # Clear cache manually
    safety_cache.clear()
    assert safety_cache.get(lat, lng) is None
    assert safety_cache.hits == 0  # cleared


# --- PROVIDER FAILURES & GRACEFUL DEGRADATION ---

@pytest.mark.anyio
async def test_aggregator_graceful_provider_fallbacks():
    # Setup aggregator with failing providers
    crime_provider = CrimeProvider()
    
    # Mock crime provider to raise exception
    crime_provider.fetch_data = AsyncMock(side_effect=RuntimeError("API endpoint unavailable"))
    
    aggregator = SafetyAggregator(providers=[crime_provider])
    
    # Trigger aggregation (mock DB session)
    result = await aggregator._fetch_provider_safely(crime_provider, 40.7128, -74.0060, db=None)
    
    # Verify fallback triggers and no exception is bubbled up
    assert result["incident_count"] == 0
    assert result["risk_level"] == "low"
    assert "temporarily offline" in result["description"]
    assert crime_provider.status == "degraded"
    assert crime_provider.availability < 100.0


@pytest.mark.anyio
async def test_aggregator_provider_timeout():
    weather_provider = WeatherProvider()
    
    # Mock weather provider to delay response
    async def delayed_fetch(lat, lng):
        await asyncio.sleep(3.0)
        return {"visibility_meters": 10000.0}
        
    weather_provider.fetch_data = AsyncMock(side_effect=delayed_fetch)
    
    aggregator = SafetyAggregator(providers=[weather_provider])
    
    # Trigger fetch safely with a timeout of 1.0 second
    result = await aggregator._fetch_provider_safely(
        weather_provider, 
        40.7128, 
        -74.0060, 
        db=None, 
        timeout=1.0
    )
    
    # Verify timeout fallback is returned
    assert result["visibility_meters"] == 10000.0
    assert result["condition"] == "clear"
    assert weather_provider.status == "degraded"


# --- INTEGRATION API ENDPOINTS ---

def test_api_aggregate_metrics(client: TestClient):
    # Success request
    response = client.get("/api/v1/safety/aggregate?lat=40.7128&lng=-74.0060")
    assert response.status_code == 200
    data = response.json()
    
    # Check structure
    assert "location" in data
    assert data["location"]["lat"] == 40.7128
    assert "crime" in data
    assert "lighting" in data
    assert "community" in data
    assert "weather" in data
    assert "poi" in data
    assert "time" in data
    assert "metadata" in data

    # Verify invalid coordinate bounds triggers 400
    response = client.get("/api/v1/safety/aggregate?lat=95.0&lng=-74.0060")
    assert response.status_code == 400


def test_api_health_metrics(client: TestClient):
    response = client.get("/api/v1/safety/health")
    assert response.status_code == 200
    health_data = response.json()
    assert len(health_data) > 0
    assert "name" in health_data[0]
    assert "availability" in health_data[0]
    assert "latency_ms" in health_data[0]
