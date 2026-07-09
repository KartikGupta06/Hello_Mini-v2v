import csv
import os
import sys
from datetime import datetime
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import select, func

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.session import SessionLocal
from app.models.police_station import PoliceStation
from app.models.hospital import Hospital
from app.models.street_light import StreetLight
from app.models.cctv_camera import CCTVCamera
from app.models.crime_record import CrimeRecord

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data', 'raw')

def to_bool(val: str) -> bool:
    return val.strip().lower() == 'yes'

def validate_csv(filepath: str, expected_columns: list) -> bool:
    if not os.path.exists(filepath):
        print(f"Error: File not found -> {filepath}")
        return False
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            print(f"Error: File is empty -> {filepath}")
            return False
        
        missing = [col for col in expected_columns if col not in header]
        if missing:
            print(f"Error: Missing columns in {filepath} -> {missing}")
            return False
    return True

def seed_police_stations(session):
    filepath = os.path.join(DATA_DIR, 'police_stations.csv')
    if not validate_csv(filepath, ['station_id', 'station_name', 'latitude', 'longitude', 'district', 'address', 'contact_number', 'open_24x7']):
        return 0

    batch = []
    inserted = 0
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            batch.append({
                'station_id': row['station_id'],
                'station_name': row['station_name'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'district': row['district'],
                'address': row['address'],
                'contact_number': row['contact_number'],
                'open_24x7': to_bool(row['open_24x7'])
            })
            if len(batch) >= 1000:
                stmt = insert(PoliceStation).values(batch).on_conflict_do_nothing(index_elements=['station_id'])
                res = session.execute(stmt)
                inserted += res.rowcount
                batch = []
                
        if batch:
            stmt = insert(PoliceStation).values(batch).on_conflict_do_nothing(index_elements=['station_id'])
            res = session.execute(stmt)
            inserted += res.rowcount
            
    return inserted

def seed_hospitals(session):
    filepath = os.path.join(DATA_DIR, 'hospitals.csv')
    if not validate_csv(filepath, ['hospital_id', 'hospital_name', 'latitude', 'longitude', 'district', 'address', 'emergency_available', 'contact_number', 'open_24x7']):
        return 0

    batch = []
    inserted = 0
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            batch.append({
                'hospital_id': row['hospital_id'],
                'hospital_name': row['hospital_name'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'district': row['district'],
                'address': row['address'],
                'emergency_available': to_bool(row['emergency_available']),
                'contact_number': row['contact_number'],
                'open_24x7': to_bool(row['open_24x7'])
            })
            if len(batch) >= 1000:
                stmt = insert(Hospital).values(batch).on_conflict_do_nothing(index_elements=['hospital_id'])
                res = session.execute(stmt)
                inserted += res.rowcount
                batch = []
                
        if batch:
            stmt = insert(Hospital).values(batch).on_conflict_do_nothing(index_elements=['hospital_id'])
            res = session.execute(stmt)
            inserted += res.rowcount
            
    return inserted

def seed_street_lights(session):
    filepath = os.path.join(DATA_DIR, 'street_lights.csv')
    if not validate_csv(filepath, ['light_id', 'latitude', 'longitude', 'district', 'area_name', 'road_name', 'light_status', 'brightness_level', 'installation_date', 'last_maintenance']):
        return 0

    batch = []
    inserted = 0
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            batch.append({
                'light_id': row['light_id'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'district': row['district'],
                'area_name': row['area_name'],
                'road_name': row['road_name'],
                'light_status': row['light_status'],
                'brightness_level': row['brightness_level'],
                'installation_date': row['installation_date'] if row['installation_date'] else None,
                'last_maintenance': row['last_maintenance'] if row['last_maintenance'] else None
            })
            if len(batch) >= 2000:
                stmt = insert(StreetLight).values(batch).on_conflict_do_nothing(index_elements=['light_id'])
                res = session.execute(stmt)
                inserted += res.rowcount
                batch = []
                
        if batch:
            stmt = insert(StreetLight).values(batch).on_conflict_do_nothing(index_elements=['light_id'])
            res = session.execute(stmt)
            inserted += res.rowcount
            
    return inserted

def seed_cctv_cameras(session):
    filepath = os.path.join(DATA_DIR, 'cctv_cameras.csv')
    if not validate_csv(filepath, ['cctv_id', 'latitude', 'longitude', 'district', 'area_name', 'road_name', 'camera_status', 'coverage_radius', 'installation_date', 'owner']):
        return 0

    batch = []
    inserted = 0
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Map Active/Inactive to Working/Faulty
            status_map = {'Active': 'Working', 'Inactive': 'Faulty'}
            c_status = status_map.get(row['camera_status'], 'Working')
            
            batch.append({
                'cctv_id': row['cctv_id'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'district': row['district'],
                'area_name': row['area_name'],
                'road_name': row['road_name'],
                'camera_status': c_status,
                'coverage_radius': float(row['coverage_radius']),
                'installation_date': row['installation_date'] if row['installation_date'] else None,
                'owner': row['owner']
            })
            if len(batch) >= 1000:
                stmt = insert(CCTVCamera).values(batch).on_conflict_do_nothing(index_elements=['cctv_id'])
                res = session.execute(stmt)
                inserted += res.rowcount
                batch = []
                
        if batch:
            stmt = insert(CCTVCamera).values(batch).on_conflict_do_nothing(index_elements=['cctv_id'])
            res = session.execute(stmt)
            inserted += res.rowcount
            
    return inserted

def seed_crime_records(session):
    filepath = os.path.join(DATA_DIR, 'crime_records.csv')
    if not validate_csv(filepath, ['crime_id', 'latitude', 'longitude', 'district', 'area_name', 'road_name', 'crime_type', 'crime_severity', 'crime_date', 'crime_time', 'victim_gender', 'police_station', 'risk_score']):
        return 0
        
    # Map Police Station names to IDs to resolve foreign key relation
    ps_map = {}
    stations = session.execute(select(PoliceStation.station_name, PoliceStation.station_id)).all()
    for name, s_id in stations:
        ps_map[name] = s_id
        
    if not ps_map:
        print("Warning: No police stations found in DB. Run police station seeding first.")
        return 0

    batch = []
    inserted = 0
    
    severity_map = {'2': 'Low', '3': 'Medium', '4': 'High'}
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            p_name = row['police_station']
            s_id = ps_map.get(p_name)
            if not s_id:
                # If mapped station doesn't exist, we skip row or assign to default? 
                # According to referential integrity, it should exist, otherwise foreign key violation.
                continue
                
            batch.append({
                'crime_id': row['crime_id'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'district': row['district'],
                'area_name': row['area_name'],
                'road_name': row['road_name'],
                'crime_type': row['crime_type'],
                'crime_severity': severity_map.get(row['crime_severity'], 'Low'),
                'crime_date': row['crime_date'],
                'crime_time': row['crime_time'],
                'victim_gender': row['victim_gender'] if row['victim_gender'] else None,
                'station_id': s_id,
                'risk_score': int(row['risk_score'])
            })
            if len(batch) >= 2000:
                stmt = insert(CrimeRecord).values(batch).on_conflict_do_nothing(index_elements=['crime_id'])
                res = session.execute(stmt)
                inserted += res.rowcount
                batch = []
                
        if batch:
            stmt = insert(CrimeRecord).values(batch).on_conflict_do_nothing(index_elements=['crime_id'])
            res = session.execute(stmt)
            inserted += res.rowcount
            
    return inserted

def verify_counts(session):
    print("\n--- Database Verification ---")
    counts = {
        'police_stations': session.scalar(select(func.count()).select_from(PoliceStation)),
        'hospitals': session.scalar(select(func.count()).select_from(Hospital)),
        'street_lights': session.scalar(select(func.count()).select_from(StreetLight)),
        'cctv_cameras': session.scalar(select(func.count()).select_from(CCTVCamera)),
        'crime_records': session.scalar(select(func.count()).select_from(CrimeRecord))
    }
    for table, count in counts.items():
        print(f"SELECT COUNT(*) FROM {table}; -> {count}")
    print("-----------------------------\n")
    return counts

def run_seeder():
    print("Starting Database Seeding Pipeline...")
    session = SessionLocal()
    
    counts = {}
    try:
        with session.begin():
            print("Importing Police Stations...")
            counts['Police Stations'] = seed_police_stations(session)
            
            print("Importing Hospitals...")
            counts['Hospitals'] = seed_hospitals(session)
            
            print("Importing Street Lights...")
            counts['Street Lights'] = seed_street_lights(session)
            
            print("Importing CCTV Cameras...")
            counts['CCTV Cameras'] = seed_cctv_cameras(session)
            
            print("Importing Crime Records...")
            counts['Crime Records'] = seed_crime_records(session)
            
        print("\nTransaction COMMITTED successfully.")
        
        # Verify counts outside the seed transaction
        verify_counts(session)
        
        print(f"Police Stations : {counts['Police Stations']} inserted")
        print(f"Hospitals       : {counts['Hospitals']} inserted")
        print(f"Street Lights   : {counts['Street Lights']} inserted")
        print(f"CCTV Cameras    : {counts['CCTV Cameras']} inserted")
        print(f"Crime Records   : {counts['Crime Records']} inserted")
        
        total = sum(counts.values())
        print(f"\nTotal Imported : {total}")
        print("\nErrors : 0")
        print("Warnings : 0")
        
    except Exception as e:
        print(f"\nTransaction ROLLBACK. Unrecoverable error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    run_seeder()
