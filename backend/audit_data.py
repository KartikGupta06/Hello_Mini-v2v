import sys
import os
from sqlalchemy import select, func
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.police_station import PoliceStation
from app.models.hospital import Hospital
from app.models.street_light import StreetLight
from app.models.cctv_camera import CCTVCamera
from app.models.crime_record import CrimeRecord

def run_audit():
    print("Initializing Database Quality Audit...")
    session = SessionLocal()
    
    try:
        # 1. Coordinate Bounds Auditing
        print("\n--- Coordinating Bounds Audit ---")
        models = [
            ("PoliceStation", PoliceStation, "latitude", "longitude"),
            ("Hospital", Hospital, "latitude", "longitude"),
            ("StreetLight", StreetLight, "latitude", "longitude"),
            ("CCTVCamera", CCTVCamera, "latitude", "longitude"),
            ("CrimeRecord", CrimeRecord, "latitude", "longitude")
        ]
        
        for name, model, lat_col, lng_col in models:
            min_lat = session.scalar(select(func.min(getattr(model, lat_col))))
            max_lat = session.scalar(select(func.max(getattr(model, lat_col))))
            min_lng = session.scalar(select(func.min(getattr(model, lng_col))))
            max_lng = session.scalar(select(func.max(getattr(model, lng_col))))
            
            invalid_lat = session.scalar(select(func.count()).where((getattr(model, lat_col) < -90) | (getattr(model, lat_col) > 90)))
            invalid_lng = session.scalar(select(func.count()).where((getattr(model, lng_col) < -180) | (getattr(model, lng_col) > 180)))
            
            print(f"{name}:")
            print(f"  Lat Range: [{min_lat}, {max_lat}] | Invalid: {invalid_lat}")
            print(f"  Lng Range: [{min_lng}, {max_lng}] | Invalid: {invalid_lng}")

        # 2. Referential Integrity
        print("\n--- Referential Integrity Audit ---")
        orphan_crimes = session.scalar(
            select(func.count())
            .select_from(CrimeRecord)
            .outerjoin(PoliceStation, CrimeRecord.station_id == PoliceStation.station_id)
            .where(PoliceStation.station_id == None)
        )
        print(f"Orphan Crime Records (crimes referencing missing stations): {orphan_crimes}")
        
        # 3. Enum Values / Constraints checks
        print("\n--- Enum & Domains Audit ---")
        invalid_severities = session.scalar(
            select(func.count()).select_from(CrimeRecord).where(CrimeRecord.crime_severity.notin_(['Low', 'Medium', 'High']))
        )
        print(f"CrimeRecord Invalid Severities count: {invalid_severities}")
        
        invalid_cctv_statuses = session.scalar(
            select(func.count()).select_from(CCTVCamera).where(CCTVCamera.camera_status.notin_(['Working', 'Faulty']))
        )
        print(f"CCTV Camera Invalid Status count: {invalid_cctv_statuses}")
        
        invalid_light_statuses = session.scalar(
            select(func.count()).select_from(StreetLight).where(StreetLight.light_status.notin_(['Working', 'Faulty']))
        )
        print(f"StreetLight Invalid Status count: {invalid_light_statuses}")
        
        risk_score_bounds = session.scalar(
            select(func.count()).select_from(CrimeRecord).where((CrimeRecord.risk_score < 0) | (CrimeRecord.risk_score > 100))
        )
        print(f"CrimeRecord Risk Scores outside [0, 100] bounds count: {risk_score_bounds}")

        # 4. Null checks for critical fields
        print("\n--- Null Integrity Audit ---")
        null_stations_name = session.scalar(select(func.count()).select_from(PoliceStation).where(PoliceStation.station_name == None))
        null_hospitals_name = session.scalar(select(func.count()).select_from(Hospital).where(Hospital.hospital_name == None))
        print(f"PoliceStation NULL names: {null_stations_name}")
        print(f"Hospital NULL names: {null_hospitals_name}")
        
        print("\nAudit complete.")
    except Exception as e:
        print(f"Error during audit: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    run_audit()
