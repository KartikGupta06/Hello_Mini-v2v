import pytest
from datetime import time, date
from sqlalchemy.orm import Session
from app.ai.services.safety_engine import safety_engine
from app.models.street_light import StreetLight
from app.models.cctv_camera import CCTVCamera
from app.models.crime_record import CrimeRecord
from app.models.police_station import PoliceStation
from app.models.hospital import Hospital

def test_safety_engine_modular_calculations(db: Session):
    # 1. Clean tables
    db.query(StreetLight).delete()
    db.query(CCTVCamera).delete()
    db.query(CrimeRecord).delete()
    db.query(PoliceStation).delete()
    db.query(Hospital).delete()
    db.commit()

    lat, lng = 28.7041, 77.1025

    # 2. Test empty db (No data -> default low confidence, perfect score prior to modifiers)
    res = safety_engine.evaluate_safety(db, lat, lng, current_time=time(12, 0), current_date=date(2026, 7, 10))
    # Safety score starts at 100. No crime or lighting issues -> score 100.
    assert res["safety_score"] == 100.0
    assert res["risk_level"] == "Very Safe"
    # Zero telemetry points -> 0% confidence
    assert res["confidence_percentage"] == 0.0
    assert res["confidence_level"] == "Low"
    assert any("Warning: Low telemetry data" in w for w in res["ai_explanation"]["risks_and_warnings"])

    # 3. Add telemetry to test confidence and infrastructure check
    light1 = StreetLight(light_id="L1", latitude=lat + 0.001, longitude=lng - 0.001, district="Outer Delhi", area_name="Rohini", road_name="R1", light_status="Working", brightness_level="High")
    light2 = StreetLight(light_id="L2", latitude=lat - 0.001, longitude=lng + 0.001, district="Outer Delhi", area_name="Rohini", road_name="R1", light_status="Faulty", brightness_level="None")
    cctv = CCTVCamera(cctv_id="C1", latitude=lat + 0.0005, longitude=lng + 0.0005, district="Outer Delhi", area_name="Rohini", road_name="R1", camera_status="Working", coverage_radius=50.0, owner="Govt")
    
    db.add(light1)
    db.add(light2)
    db.add(cctv)
    db.commit()

    # 4. Evaluate during the Day (Multiplier 0.0x on Infrastructure)
    res_day = safety_engine.evaluate_safety(db, lat, lng, current_time=time(12, 0), current_date=date(2026, 7, 10))
    # Bounding box should find L1, L2, C1. Faulty light exists but multiplier is 0 during daytime.
    # Total infrastructure risk = (1 faulty * 6) = 6.0. Multiplied by 0.0 during day = 0.
    assert res_day["safety_score"] == 100.0
    assert res_day["risk_breakdown"]["adjusted_infrastructure_risk"] == 0.0
    # 3 telemetry points out of 5 target density = 60.0% confidence
    assert res_day["confidence_percentage"] == 60.0
    assert res_day["confidence_level"] == "Medium"

    # 5. Evaluate during Night (Multiplier 3.0x on Infrastructure)
    res_night = safety_engine.evaluate_safety(db, lat, lng, current_time=time(23, 0), current_date=date(2026, 7, 10))
    # 1 faulty light * 6.0 risk = 6.0 raw infra risk. Multiplied by 3.0x at night = 18.0.
    # Safety score = 100.0 - 18.0 = 82.0
    assert res_night["safety_score"] == 82.0
    assert res_night["risk_level"] == "Safe"
    assert res_night["risk_breakdown"]["adjusted_infrastructure_risk"] == 18.0
    # Faulty lights warning in risks and warnings
    assert any("faulty street light" in w for w in res_night["ai_explanation"]["risks_and_warnings"])

    # 6. Test Emergency Readiness
    ps = PoliceStation(station_id="PS1", station_name="Rohini South Station", latitude=lat + 0.002, longitude=lng - 0.002, district="Outer Delhi", open_24x7=True)
    hosp = Hospital(hospital_id="H1", hospital_name="Rohini Care Hospital", latitude=lat + 0.008, longitude=lng - 0.008, district="Outer Delhi", emergency_available=True, open_24x7=True)
    db.add(ps)
    db.add(hosp)
    db.commit()

    res_readiness = safety_engine.evaluate_safety(db, lat, lng, current_time=time(12, 0), current_date=date(2026, 7, 10))
    # Police station is close (~313m, which is <500m -> 60 points)
    # Hospital is close (~1255m, which is <3000m -> 20 points)
    # Total emergency readiness = 80 -> High
    assert res_readiness["emergency_readiness_score"] == 80.0
    assert res_readiness["readiness_level"] == "High"
    # Proximity to police station/hospital should not change daylight Safety Score (remains 100.0)
    assert res_readiness["safety_score"] == 100.0
