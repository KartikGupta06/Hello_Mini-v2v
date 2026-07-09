import sys
import os

# Add the backend directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import logging
from sqlalchemy import text
from app.database.session import engine
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_connection():
    try:
        logger.info(f"Attempting to connect to database at {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}...")
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            assert result.scalar() == 1
        logger.info("✅ Connection to PostgreSQL database was successful!")
        logger.info("✅ SQLAlchemy engine is properly configured.")
    except Exception as e:
        logger.error("❌ Failed to connect to PostgreSQL database.")
        logger.error(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
