import pytest
from fastapi.testclient import TestClient

from app.ai.risk_modules.crime import CrimeRiskModule
from app.ai.risk_modules.lighting import LightingRiskModule
from app.ai.risk_modules.poi import POIRiskModule
from app.ai.engine.decision import SafetyDecisionEngine
from app.ai.confidence.engine import ConfidenceEngine
from app.ai.reasoning.generator import ReasonGenerator


# --- RISK MODULES TESTS ---

def test_crime_risk_module_evaluation():
    module = CrimeRiskModule()
    
    # High risk
    res = module.evaluate({"crime": {"risk_level": "high", "incident_count": 15}})
    assert res["risk_score"] == 85.0
    assert "High volume" in res["reason"]
    
    # Low risk
    res = module.evaluate({"crime": {"risk_level": "low", "incident_count": 1}})
    assert res["risk_score"] == 10.0
    assert "Low historical" in res["reason"]


def test_lighting_risk_module_evaluation():
    module = LightingRiskModule()
    
    # Poor light
    res = module.evaluate({"lighting": {"lighting_level": "poor", "lamps_count": 2}})
    assert res["risk_score"] == 80.0
    
    # Excellent light
    res = module.evaluate({"lighting": {"lighting_level": "excellent", "lamps_count": 30}})
    assert res["risk_score"] == 5.0


# --- POI MITIGATION DISCOUNT TESTS ---

def test_poi_risk_mitigation():
    module = POIRiskModule()
    
    # Proximity to police stations & safe places
    data = {
        "poi": {
            "police_stations": [{"name": "P1", "address": "A1", "lat": 0.0, "lng": 0.0}],
            "safe_places": [{"name": "S1", "address": "A2", "lat": 0.0, "lng": 0.0}],
            "hospitals": [],
            "pharmacies": []
        }
    }
    res = module.evaluate(data)
    # 1 police * 10 + 1 safe * 5 = -15.0 mitigation score
    assert res["risk_score"] == -15.0
    assert "mitigates" in res["reason"]


# --- DECISION ENGINE WEIGHTS & CATEGORIES TESTS ---

def test_decision_engine_computations():
    engine = SafetyDecisionEngine()
    
    # Deterministic mock aggregated data
    aggregated_data = {
        "crime": {"risk_level": "low", "incident_count": 1},
        "lighting": {"lighting_level": "excellent", "lamps_count": 40},
        "community": {"active_reports_count": 0},
        "weather": {"condition": "clear", "visibility_meters": 10000.0},
        "time": {"hour": 12, "is_night": False},
        "future_event": {"events_count": 0},
        "poi": {
            "police_stations": [],
            "safe_places": [],
            "hospitals": [],
            "pharmacies": []
        },
        "metadata": {
            "provider_statuses": {}
        }
    }
    
    # Run evaluation
    res = engine.evaluate_safety(aggregated_data)
    
    # Crime: low (10.0) * 0.30 = 3.0
    # Lighting: excellent (5.0) * 0.25 = 1.25
    # Community: count 0 (0.0) * 0.15 = 0.0
    # Weather: clear (0.0) * 0.10 = 0.0
    # Time: daylight (0.0) * 0.15 = 0.0
    # Event: count 0 (0.0) * 0.05 = 0.0
    # Sum: 3.0 + 1.25 = 4.25 risk score
    # Safety score: 100 - 4.25 = 95.75
    assert res.safety_score == 95.75
    assert res.risk_category == "Very Safe"
    assert res.confidence_level == "High"


# --- CONFIDENCE LEVEL TESTS ---

def test_confidence_calculations():
    # 100% baseline
    data = {"metadata": {"provider_statuses": {"Crime Provider": "healthy", "Weather Provider": "healthy"}}}
    level, pct = ConfidenceEngine.calculate_confidence(data)
    assert pct == 100.0
    assert level == "High"

    # Degraded providers decrease confidence
    data_degraded = {"metadata": {"provider_statuses": {"Crime Provider": "degraded", "Weather Provider": "degraded"}}}
    level_d, pct_d = ConfidenceEngine.calculate_confidence(data_degraded)
    # 100 - 15 - 15 = 70.0%
    assert pct_d == 70.0
    assert level_d == "Medium"


# --- REASON GENERATOR TESTS ---

def test_reason_generator():
    module_results = {
        "Crime Risk": {"risk_score": 85.0, "reason": "High historical crime reports logged."},
        "Lighting Risk": {"risk_score": 5.0, "reason": "Excellent lighting coverage."}
    }
    reasons = ReasonGenerator.generate_reasons(module_results)
    # Risk warning is prioritized first
    assert reasons[0] == "High historical crime reports logged."
    assert reasons[1] == "Excellent lighting coverage."


# --- API END-TO-END ENDPOINT TESTS ---

def test_api_safety_score_calculation(client: TestClient):
    response = client.get("/api/v1/ai/safety-score?lat=40.7128&lng=-74.0060")
    assert response.status_code == 200
    data = response.json()
    
    assert "safety_score" in data
    assert "confidence_level" in data
    assert "risk_category" in data
    assert "reasons" in data
    assert "module_breakdown" in data
    assert "Crime Risk" in data["module_breakdown"]
    assert "POI Risk" in data["module_breakdown"]
