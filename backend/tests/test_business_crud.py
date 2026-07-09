import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# --- USERS & AUTH TESTS ---

def test_user_signup_and_login(client: TestClient):
    # Signup a new user
    signup_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/auth/signup", json=signup_data)
    assert response.status_code == 201
    user = response.json()
    assert user["name"] == "Test User"
    assert user["email"] == "test@example.com"
    assert "id" in user
    assert "password_hash" not in user

    # Reject duplicate email (400 case)
    response = client.post("/api/v1/auth/signup", json=signup_data)
    assert response.status_code == 400
    assert response.json()["error"] == "Email address already registered"

    # Login user
    login_data = {
        "email": "test@example.com",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()
    assert token["token_type"] == "bearer"
    assert "access_token" in token

    # Reject incorrect credentials (401 case)
    response = client.post(
        "/api/v1/auth/login", 
        json={"email": "test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_user_profile_crud(client: TestClient):
    # Signup user and login
    client.post(
        "/api/v1/auth/signup", 
        json={"name": "Alice", "email": "alice@example.com", "password": "alicepassword"}
    )
    token = client.post(
        "/api/v1/auth/login", 
        json={"email": "alice@example.com", "password": "alicepassword"}
    ).json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # Get profile (me)
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Alice"

    # Update profile
    response = client.put(
        "/api/v1/users/me", 
        json={"name": "Alice Smith", "email": "alice.smith@example.com"}, 
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Alice Smith"
    assert response.json()["email"] == "alice.smith@example.com"

    # Verify unauthorized fetch on profile (401 case)
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


# --- EMERGENCY CONTACTS TESTS ---

def test_emergency_contact_crud_and_validations(client: TestClient):
    # Signup & auth
    client.post(
        "/api/v1/auth/signup", 
        json={"name": "Bob", "email": "bob@example.com", "password": "bobpassword"}
    )
    res = client.post(
        "/api/v1/auth/login", 
        json={"email": "bob@example.com", "password": "bobpassword"}
    ).json()
    user_id = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {res['access_token']}"}).json()["id"]
    headers = {"Authorization": f"Bearer {res['access_token']}"}

    # Reject invalid phone formatting (422 validation case)
    contact_data = {
        "name": "Mom",
        "phone": "invalid-phone",
        "relationship_type": "Mother",
        "user_id": user_id
    }
    response = client.post("/api/v1/contacts/", json=contact_data, headers=headers)
    assert response.status_code == 422

    # Accept valid phone format
    contact_data["phone"] = "+15551234567"
    response = client.post("/api/v1/contacts/", json=contact_data, headers=headers)
    assert response.status_code == 201
    contact = response.json()
    assert contact["name"] == "Mom"
    assert contact["is_primary"] is False
    c1_id = contact["id"]

    # Add second contact marked primary
    contact_data_2 = {
        "name": "Dad",
        "phone": "+15559876543",
        "relationship_type": "Father",
        "is_primary": True,
        "user_id": user_id
    }
    response = client.post("/api/v1/contacts/", json=contact_data_2, headers=headers)
    assert response.status_code == 201
    c2_id = response.json()["id"]
    assert response.json()["is_primary"] is True

    # Verify first contact status remains False
    response = client.get(f"/api/v1/contacts/", headers=headers)
    contacts = response.json()
    assert len(contacts) == 2
    for c in contacts:
        if c["id"] == c1_id:
            assert c["is_primary"] is False

    # Mark first contact as primary explicitly
    response = client.post(f"/api/v1/contacts/{c1_id}/primary", headers=headers)
    assert response.status_code == 200
    assert response.json()["is_primary"] is True

    # Verify previous primary is reset
    response = client.get(f"/api/v1/contacts/", headers=headers)
    for c in response.json():
        if c["id"] == c2_id:
            assert c["is_primary"] is False

    # Delete contact and get 404 on fetching deleted (404 case)
    response = client.delete(f"/api/v1/contacts/{c2_id}", headers=headers)
    assert response.status_code == 200

    response = client.put(f"/api/v1/contacts/{c2_id}", json={"name": "Dad Updated"}, headers=headers)
    assert response.status_code == 404


# --- JOURNEY HISTORY TESTS ---

def test_journey_history_crud(client: TestClient):
    # Signup & auth
    client.post(
        "/api/v1/auth/signup", 
        json={"name": "Charlie", "email": "charlie@example.com", "password": "charliepass"}
    )
    user = client.post(
        "/api/v1/auth/login", 
        json={"email": "charlie@example.com", "password": "charliepass"}
    ).json()
    user_id = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {user['access_token']}"}).json()["id"]
    headers = {"Authorization": f"Bearer {user['access_token']}"}

    # Create journey
    journey_data = {
        "origin": "Central Park",
        "destination": "Times Square",
        "origin_lat": 40.7829,
        "origin_lng": -73.9654,
        "dest_lat": 40.7580,
        "dest_lng": -73.9855,
        "status": "active",
        "user_id": user_id,
        "journey_metadata": {"transport": "walking"}
    }
    response = client.post("/api/v1/journeys/", json=journey_data, headers=headers)
    assert response.status_code == 201
    j_id = response.json()["id"]
    assert response.json()["journey_metadata"] == {"transport": "walking"}

    # Update journey duration/completion
    response = client.put(
        f"/api/v1/journeys/{j_id}",
        json={"status": "completed", "duration_seconds": 900},
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["duration_seconds"] == 900

    # Get journeys list
    response = client.get("/api/v1/journeys/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Unauthorized access (401 case)
    response = client.get(f"/api/v1/journeys/{j_id}")
    assert response.status_code == 401


# --- COMMUNITY REPORTS TESTS ---

def test_community_reports_crud(client: TestClient):
    # Setup two users
    client.post(
        "/api/v1/auth/signup", 
        json={"name": "User A", "email": "usera@example.com", "password": "passworda"}
    )
    user_a = client.post(
        "/api/v1/auth/login", 
        json={"email": "usera@example.com", "password": "passworda"}
    ).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {user_a}"}

    client.post(
        "/api/v1/auth/signup", 
        json={"name": "User B", "email": "userb@example.com", "password": "passwordb"}
    )
    user_b = client.post(
        "/api/v1/auth/login", 
        json={"email": "userb@example.com", "password": "passwordb"}
    ).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {user_b}"}

    # Reject invalid report categories (422 validation case)
    report_data = {
        "lat": 40.7128,
        "lng": -74.0060,
        "type": "Invalid Incident Category",
        "description": "Poor street lights on corner"
    }
    response = client.post("/api/v1/reports/", json=report_data, headers=headers_a)
    assert response.status_code == 422

    # Accept valid report category (Anonymous posting)
    report_data["type"] = "Street Light Issue"
    response = client.post("/api/v1/reports/", json=report_data)
    assert response.status_code == 201
    anon_report_id = response.json()["id"]
    assert response.json()["user_id"] is None

    # Post signed report (User A)
    report_data["type"] = "Harassment"
    report_data["description"] = "Suspicious individual following pedestrians"
    response = client.post("/api/v1/reports/", json=report_data, headers=headers_a)
    assert response.status_code == 201
    signed_report_id = response.json()["id"]
    assert response.json()["user_id"] is not None

    # Query with filter category
    response = client.get("/api/v1/reports/?type=Harassment")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["type"] == "Harassment"

    # Query with search keyword
    response = client.get("/api/v1/reports/?search=individual")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Modify report validation (User B tries modifying User A's report - 403 Forbidden case)
    response = client.put(
        f"/api/v1/reports/{signed_report_id}", 
        json={"description": "Attempted edit"}, 
        headers=headers_b
    )
    assert response.status_code == 403

    # Accept modification (User A edits own report)
    response = client.put(
        f"/api/v1/reports/{signed_report_id}", 
        json={"description": "Resolved problem description"}, 
        headers=headers_a
    )
    assert response.status_code == 200
    assert response.json()["description"] == "Resolved problem description"

    # Delete report
    response = client.delete(f"/api/v1/reports/{signed_report_id}", headers=headers_a)
    assert response.status_code == 200

    # Ensure report is gone (404 case)
    response = client.get(f"/api/v1/reports/{signed_report_id}")
    assert response.status_code == 404
