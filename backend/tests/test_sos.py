from fastapi.testclient import TestClient

def test_sos_trigger_success(client: TestClient):
    # Trigger SOS for a location
    payload = {
        "latitude": 28.6304,
        "longitude": 77.2177
    }
    response = client.post("/api/v1/sos/trigger", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sos_status"] == "active"
    assert "nearest_police" in data
    assert "nearest_hospital" in data
    assert "nearby_police_stations" in data
    assert "nearby_hospitals" in data
    assert "message" in data

def test_sos_trigger_invalid_coordinates(client: TestClient):
    # Invalid latitude
    payload = {
        "latitude": 120.0,
        "longitude": 77.2177
    }
    response = client.post("/api/v1/sos/trigger", json=payload)
    assert response.status_code == 422  # Pydantic validation error

def test_sos_trigger_missing_fields(client: TestClient):
    payload = {
        "latitude": 28.6304
    }
    response = client.post("/api/v1/sos/trigger", json=payload)
    assert response.status_code == 422  # Pydantic validation error
