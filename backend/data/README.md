# SafeRoute AI - Datasets Directory

This directory stores datasets used by SafeRoute AI to evaluate and rank route safety.

## Directory Structure
*   `raw/`: Raw, unaltered source datasets.
*   `processed/`: Cleaned, parsed, and normalized datasets optimized for database import or engine usage.
*   `exports/`: Generated statistics, analyzer runs, or analytical export outputs.

---

## Dataset Catalog

### 1. Historical Crime Records
*   **Dataset Name:** `historical_crime_records.csv`
*   **Source:** Local Open Data Portal / Metropolitan Police Department APIs
*   **Row Count:** ~50,000 records (anticipated for initial local validation)
*   **Last Updated:** 2026-07-09
*   **Purpose:** Provides spatial coordinates and timestamps of historical security incidents. Used by the `RiskEngine` to establish crime hotspot maps.

### 2. Street Lighting Infrastructure
*   **Dataset Name:** `street_lighting_coverage.json` / `.csv`
*   **Source:** Municipal Public Works / Street Light Asset Registry
*   **Row Count:** ~12,000 coordinates (anticipated mapping for urban pilot zone)
*   **Last Updated:** 2026-07-08
*   **Purpose:** Captures exact geolocation and status (operational, type, intensity) of streetlights. Used to calculate lighting safety coefficients during late-night routes.

### 3. Safe Havens Index
*   **Dataset Name:** `safe_havens_index.csv`
*   **Source:** Verified crowdsourced points of interest, Police Stations, and 24/7 commercial stores.
*   **Row Count:** ~500 entries (pilot zone coverage)
*   **Last Updated:** 2026-07-10
*   **Purpose:** Contains names, contact numbers, categories, and geolocations of secure establishments. Imported into the `Safe Havens` database table to assist users in routing to closest shelter during emergencies.

---

## Data Pipeline Flow
1.  Place fresh source datasets in `raw/`.
2.  Run sanitization and coordinate projection scripts (mapping to unified ESPG:4326 WGS 84 system) to output formatted files in `processed/`.
3.  Execute database seeding using `app/database/seed.py` to ingest processed data into the PostgreSQL/SQLAlchemy schemas.
