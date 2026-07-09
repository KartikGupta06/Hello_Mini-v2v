# SafeRoute AI - Backend Command Center

This document tracks the progress, roadmap, and tasks for the SafeRoute AI Python Backend. It acts as the single source of truth for all backend services, database migrations, AI logic refactoring, and integration endpoints.

---

## Current Status

**Current Phase:** Phase 4 – PostgreSQL Setup
**Next Planned Phase:** Phase 5 – SQLAlchemy Models

---

## Backend Phases

☑ Phase 1 – Repository Analysis
☑ Phase 2 – Backend Architecture
☑ Phase 3 – Dataset Engineering

☐ Phase 4 – PostgreSQL Setup
☐ Phase 5 – SQLAlchemy Models
☐ Phase 6 – Alembic Migrations
☐ Phase 7 – Database Seeding
☐ Phase 8 – FastAPI APIs
☐ Phase 9 – AI Safety Engine
☐ Phase 10 – Route Recommendation Engine
☐ Phase 11 – Authentication
☐ Phase 12 – Testing
☐ Phase 13 – Final Backend Freeze

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
