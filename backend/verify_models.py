import sys
import os

# Add current folder to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.base import Base
import app.models  # This should import everything via __init__.py

def verify():
    print("Checking registered SQLAlchemy models...")
    tables = list(Base.metadata.tables.keys())
    print(f"Registered tables ({len(tables)}): {tables}")
    
    expected_tables = {
        "police_stations", "hospitals", "street_lights", "cctv_cameras", "crime_records"
    }
    
    missing = expected_tables - set(tables)
    if missing:
        print(f"ERROR: Missing expected tables in metadata: {missing}")
        sys.exit(1)
        
    print("SUCCESS: All frozen database models are successfully registered with SQLAlchemy metadata!")
    print("SUCCESS: No circular imports detected.")

if __name__ == "__main__":
    verify()
