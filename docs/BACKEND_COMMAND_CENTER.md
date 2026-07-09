# SafeRoute AI - Backend Command Center

This document tracks the progress, roadmap, and tasks for the SafeRoute AI Python Backend. It acts as the single source of truth for all backend services, database migrations, AI logic refactoring, and integration endpoints.

---

## Current Status

**Current Phase:** Phase 4.3 – SQLAlchemy Models
**Next Planned Phase:** Phase 4.4 – Alembic Initial Migration

---

## Backend Phases

☑ Phase 1 – Repository Analysis
☑ Phase 2 – Backend Architecture
☑ Phase 3 – Dataset Engineering

☑ Phase 4.1 – PostgreSQL Environment Setup
☑ Phase 4.2 – Database Schema Design
☑ Phase 4.3 – SQLAlchemy Models
☐ Phase 4.4 – Alembic Initial Migration
☐ Phase 5 – Database Seeding
☐ Phase 6 – FastAPI APIs
☐ Phase 7 – AI Safety Engine
☐ Phase 8 – Route Recommendation Engine
☐ Phase 9 – Authentication
☐ Phase 10 – Testing
☐ Phase 11 – Final Backend Freeze

---

## Backend Timeline

**Date:** 09 July 2026

**Phase:** Phase 1 – Repository Analysis

**Task:** Repository Analysis

**Status:** ✅ Completed

**Summary:**
Analyzed existing repository architecture and finalized backend integration strategy.

---

**Date:** 09 July 2026

**Phase:** Phase 2 – Backend Architecture

**Task:** Backend Architecture Freeze

**Status:** ✅ Completed

**Summary:**
Restructured the backend file layout, data folders, and defined the clear separation of AI, routing, and safety modules.

---

**Date:** 09 July 2026

**Phase:** Phase 3 – Dataset Engineering

**Task:** Dataset Planning

**Status:** ✅ Completed

**Summary:**
Planned the synthetic generation pipeline for five core datasets (Crimes, Street Lights, CCTV, Police Stations, Hospitals).

---

**Date:** 09 July 2026

**Phase:** Phase 3 – Dataset Engineering

**Task:** Dataset Generation

**Status:** ✅ Completed

**Summary:**
Built and executed the Python dataset generation script utilizing internal logic and OpenStreetMap bounds.

---

**Date:** 09 July 2026

**Phase:** Phase 3 – Dataset Engineering

**Task:** Dataset Validation

**Status:** ✅ Completed

**Summary:**
Verified dataset outputs to ensure accurate risk score algorithms and internal validity.

---

**Date:** 10 July 2026

**Phase:** Phase 3 – Dataset Engineering

**Task:** Multi-region Expansion

**Status:** ✅ Completed

**Summary:**
Expanded the script to precisely generate and assign events across South Delhi, North-East Delhi, and Outer Delhi.

---

**Date:** 10 July 2026

**Phase:** Phase 3 – Dataset Engineering

**Task:** Final Dataset Freeze

**Status:** ✅ Completed

**Summary:**
Completed dataset validation, verified referential integrity, confirmed PostgreSQL compatibility, and officially froze the dataset for backend implementation.

---

**Date:** 10 July 2026

**Phase:** Phase 4 – Database Foundation

**Task:** Phase 4.1 PostgreSQL Environment Setup

**Status:** ✅ Completed

**Summary:**
Configured `.env`, implemented Pydantic `config.py`, set up SQLAlchemy engine and `session.py`, and verified database connectivity successfully.

---

**Date:** 10 July 2026

**Phase:** Phase 4 – Database Foundation

**Task:** Dockerized PostgreSQL Environment Setup

**Status:** ✅ Completed

**Summary:**
Created docker-compose.yml configuration to run PostgreSQL and pgAdmin in Docker. Verified container orchestrations, persistence volume, and established a successful connection from the SQLAlchemy engine.

---

**Date:** 10 July 2026

**Phase:** Phase 4 – Database Foundation

**Task:** Phase 4.2 Database Schema Design

**Status:** ✅ Completed

**Summary:**
Designed a normalized, production-ready schema mapped directly to the five core frozen datasets (Crimes, Police Stations, Hospitals, Lights, CCTV). Documented datatypes, ER diagram, index strategies, and scalability pathways.

---

**Date:** 10 July 2026

**Phase:** Phase 4 – Database Foundation

**Task:** Phase 4.2 Database Schema Refinement

**Status:** ✅ Completed

**Summary:**
Refined the schema by normalizing the Crime → Police Station relationship to reference station_id instead of station_name. Removed premature UNIQUE constraints from station_name and hospital_name while maintaining district column denormalizations.

---

**Date:** 10 July 2026

**Phase:** Phase 4 – Database Foundation

**Task:** Phase 4.3 SQLAlchemy Models

**Status:** ✅ Completed

**Summary:**
Codified the frozen and refined database schema into SQLAlchemy ORM models (CrimeRecord, PoliceStation, Hospital, StreetLight, CCTVCamera) with correct datatypes, default values, and check constraints. Clarified that pre-existing repository models (`User`, `EmergencyContact`, `JourneyHistory`, `CommunityReport`) were strictly separated from newly created dataset models and were not modified.

---

## Decision Log

- **Architecture:** Keep AI, routing, and safety logic strictly decoupled in `app/ai`, `app/routing`, and `app/safety`.
- **Data Engineering:** Use genuine OpenStreetMap boundaries and infrastructure (Hospitals, Police) over arbitrary bounding boxes, with strict fallback dictionaries for 429 rate limit protections.

---

## Change Log

- **10 July 2026:** Finalized and frozen the MVP dataset generation pipeline (`generate_datasets.py`) with full multi-region and referential integrity support.
- **09 July 2026:** Defined the SafeRoute AI modular backend architecture.

---

## Finalized Backend Architecture Directory Layout
Once frozen, the backend layout will adhere strictly to the following target structure:

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/           # API Routers (auth, users, emergency, etc.)
│   ├── core/                        # Settings, security, JWT
│   ├── database/
│   │   ├── base.py
│   │   ├── session.py
│   │   └── seed.py                  # Seed scripts for CSV uploads
│   ├── models/                      # SQLAlchemy Database Models
│   ├── schemas/                     # Pydantic Schemas
│   ├── services/                    # Core Business Logic Services
│   ├── ai/
│   │   ├── safety_score.py          # Concurrently manages safety scores & weight aggregations
│   │   ├── risk_engine.py           # Multi-modal risk scoring (crime, light, event, etc.)
│   │   └── recommendation.py        # Explainable safety recommendations generator
│   ├── routing/
│   │   ├── route_analyzer.py        # Path coordinates parsing & segment hotspot lookup
│   │   └── route_ranker.py          # ETA vs. safety distance ranker
│   ├── safety/
│   │   ├── hotspot_detector.py      # Detects coordinates anomalies and spikes in safety risk
│   │   └── safety_aggregator.py     # Provider orchestrator
│   └── utils/                       # Shared utility functions
├── data/
│   ├── raw/                         # Raw, uncleaned datasets (e.g. CSVs)
│   ├── processed/                   # Standardized/formatted datasets
│   └── exports/                     # Generated route metrics and stats outputs
├── tests/                           # Pytest tests
├── alembic/                         # Database migrations
└── requirements.txt
```
