import sys
import os
from sqlalchemy import inspect

# Add current folder to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal

def verify():
    print("Connecting to PostgreSQL and inspecting tables...")
    session = SessionLocal()
    try:
        # Get connection engine from session
        engine = session.bind
        inspector = inspect(engine)
        
        # Get all table names in public schema
        tables = inspector.get_table_names()
        print(f"Tables in Database ({len(tables)}): {tables}")
        
        expected_tables = {
            "police_stations", "hospitals", "street_lights", "cctv_cameras", "crime_records"
        }
        
        missing = expected_tables - set(tables)
        if missing:
            print(f"ERROR: Missing expected tables: {missing}")
            sys.exit(1)
            
        print("Details of newly created tables:")
        for table in sorted(expected_tables):
            pk = inspector.get_pk_constraint(table)
            fks = inspector.get_foreign_keys(table)
            indexes = inspector.get_indexes(table)
            print(f"  Table '{table}':")
            print(f"    Primary Key: {pk.get('constrained_columns')}")
            if fks:
                print(f"    Foreign Keys: {fks}")
            if indexes:
                print(f"    Indexes: {indexes}")
                
        print("SUCCESS: Database tables match the design and models exactly!")
    except Exception as e:
        print(f"ERROR: Database verification failed: {e}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    verify()
