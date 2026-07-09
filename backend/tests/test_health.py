from fastapi.testclient import TestClient

def test_get_health(client: TestClient):
    """Test health validation and database link checks."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "app_name" in data

def test_get_status(client: TestClient):
    """Test status quick checks API."""
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    assert response.json() == {"status": "OK"}

def test_get_version(client: TestClient):
    """Test version description checks API."""
    response = client.get("/api/v1/version")
    assert response.status_code == 200
    data = response.json()
    assert data["version"] == "1.0.0"
    assert data["api_version"] == "v1"
