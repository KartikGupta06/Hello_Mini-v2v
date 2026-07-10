import sys
import os
from alembic.config import Config
from alembic import command
from sqlalchemy import select, func

from app.database.session import SessionLocal
from app.database.seed import run_seeder
from app.models.user import User
from app.models.police_station import PoliceStation
from app.core.security import get_password_hash
from app.core.config import settings

def is_testing() -> bool:
    """Detect if the application is running under pytest."""
    return "pytest" in sys.modules

def run_migrations():
    """Programmatically execute Alembic migrations."""
    print("Running Alembic migrations...")
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        alembic_ini_path = os.path.join(base_dir, "alembic.ini")
        
        if os.path.exists(alembic_ini_path):
            alembic_cfg = Config(alembic_ini_path)
            # Ensure the config points to the right DB URI (already done in env.py, but safe to set here)
            alembic_cfg.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)
            command.upgrade(alembic_cfg, "head")
        else:
            print(f"Warning: alembic.ini not found at {alembic_ini_path}. Skipping migrations.")
    except Exception as e:
        print(f"Error running Alembic migrations: {e}")

def seed_database_if_empty():
    """Check if tables are empty and seed CSV data if necessary."""
    session = SessionLocal()
    try:
        police_count = session.scalar(select(func.count()).select_from(PoliceStation))
        if police_count == 0:
            print("Database empty.")
            print("Seeding datasets...")
            # run_seeder() prints its own logs but we can suppress or just let it print
            run_seeder()
        else:
            print("Database already initialized.")
            print("Skipping seeding.")
    except Exception as e:
        print(f"Error checking or seeding database: {e}")
    finally:
        session.close()

def create_demo_user_if_missing():
    """Ensure the demo user exists."""
    session = SessionLocal()
    try:
        demo_user = session.execute(
            select(User).filter(User.email == "demo@saferoute.ai")
        ).scalar_one_or_none()
        
        if not demo_user:
            password = settings.DEMO_USER_PASSWORD
            new_user = User(
                name="Demo User",
                email="demo@saferoute.ai",
                password_hash=get_password_hash(password),
                role="user"
            )
            session.add(new_user)
            session.commit()
            print("Demo user created.")
        else:
            print("Demo user already exists.")
    except Exception as e:
        print(f"Error creating demo user: {e}")
    finally:
        session.close()

async def initialize_application():
    """Main entry point for production auto-initialization."""
    if is_testing():
        print("Test environment detected. Skipping auto-initialization.")
        return

    # 1. Run migrations
    run_migrations()
    
    # 2. Seed database
    seed_database_if_empty()
    
    # 3. Create demo user
    create_demo_user_if_missing()
    
    print("Application Ready.")
