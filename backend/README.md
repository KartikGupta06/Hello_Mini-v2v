# SafeRoute AI - Backend Foundation

This directory houses the Python FastAPI backend engine for **SafeRoute AI**. The architecture follows the **Layered Architecture & Repository Pattern** to separate data models, schemas validation, transaction persistency, and api routing controllers cleanly.

## Directory Structure
```
backend/
├── .env.example            # Configuration variables templates
├── .env                    # Local developer env parameters
├── requirements.txt        # Backend dependencies
├── README.md               # Backend documentation
├── app/
│   ├── main.py             # FastAPI entrypoint, middlewares, CORS, routers inclusion
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── health.py # Monitor health, status, version endpoints
│   ├── core/
│   │   ├── config.py       # Pydantic Settings loaders
│   │   └── security.py     # Bcrypt password hashing, JWT encoding/decoding
│   ├── database/
│   │   ├── base.py         # SQLAlchemy Base models exporter
│   │   └── session.py      # SQLAlchemy session builders
│   ├── dependencies/
│   │   └── auth.py         # JWT Authorization parsing middleware dependencies
│   ├── middleware/
│   │   ├── errors.py       # Global Exceptions & Request Validation handlers
│   │   └── logging.py      # Middleware to intercept request performance speeds
│   ├── models/             # SQLAlchemy ORM Database Schemas
│   │   ├── user.py
│   │   ├── contact.py
│   │   ├── journey.py
│   │   └── report.py
│   ├── repositories/       # Generic Base CRUD and specialised repositories
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── contact.py
│   │   ├── journey.py
│   │   └── report.py
│   ├── schemas/            # Pydantic serializer/request validators schemas
│   │   ├── user.py
│   │   ├── contact.py
│   │   ├── journey.py
│   │   ├── report.py
│   │   └── token.py
│   └── services/           # Stub services layers separating business logics
│       └── auth.py
└── tests/                  # Integration tests layouts
    ├── conftest.py         # Pytest client factories and SQLite overrides
    └── test_health.py      # Monitoring routes sanity checks suite
```

## Tech Stack
*   **Python 3.10+** (Core programming language)
*   **FastAPI** (High performance ASGI web framework)
*   **SQLAlchemy** (SQL Toolkit and ORM engine mapping PostgreSQL/SQLite)
*   **Pydantic / Pydantic Settings** (Data schemas serializations and configurations validation)
*   **Supabase PostgreSQL** (Relational SQL cloud database engine)
*   **Passlib (Bcrypt) & Python-jose** (Secure password hashing and signed JWT token creation)
*   **Pytest** (Testing harness)

## Development Setup

### 1. Prerequisites & Virtual Environment
Create and activate a python virtual environment inside the `backend/` folder:
```bash
cd backend
python -m venv venv

# On Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# On macOS / Linux
source venv/bin/activate
```

### 2. Install Dependencies
Install requirement packages list:
```bash
pip install -r requirements.txt
```

### 3. Local Configuration
Copy `.env.example` as `.env` and fill the variables:
```bash
cp .env.example .env
```
*(For local testing, `DATABASE_URL` defaults to SQLite `sqlite:///./test.db` if Postgres is not configured).*

### 4. Running the Dev Server
Launch uvicorn with hot-reload support:
```bash
uvicorn app.main:app --reload
```
Once booted, you can access:
*   **API Docs (Swagger)**: [http://127.0.0.1:8000/api/v1/docs](http://127.0.0.1:8000/api/v1/docs)
*   **Health Route**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

### 5. Running Tests
Run functional integration tests using pytest:
```bash
pytest
```
*(Tests utilize SQLite memory engines, guaranteeing complete isolation from active database environments).*
