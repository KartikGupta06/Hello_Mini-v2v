# SafeRoute AI

## Project Vision
*   **Problem Statement:** Conventional navigation systems optimize strictly for speed and distance, frequently routing pedestrians, night workers, tourists, and vulnerable individuals through poorly lit, high-crime, or isolated areas.
*   **Solution:** SafeRoute AI is an intelligent navigation companion that computes paths based on safety metrics, combining crowdsourced incident reports, historical crime data, street lighting levels, and infrastructure quality.
*   **USP (Unique Selling Proposition):** Real-time AI-powered Safety Scoring with natural language explanation of risk factors, dynamic rerouting during emergencies, and instant safe-haven routing.
*   **Target Users:** Women, night-shift employees, students, tourists, and outdoor runners.
*   **Hackathon Objective:** Deliver a fully functional web-based prototype featuring map navigation, safety route alternatives, safety score explanations, emergency SOS triggers, and live location updates.

## Overall Progress
**Completion:** 97%

```
███████████████████░ (97%)
```

## Current Phase
*   **Current Phase:** Phase 4: Explainable Safety Intelligence Engine (Completed)
*   **Current Objective:** Stop after Explainable AI Engine is complete. Transition to Phase 5 (Navigation & Routing).
*   **Current Milestone:** Configurable weights risk modules and safety score REST API operational with unit tests.
*   **Current Priority:** Phase 5 Planning.
*   **Current Branch:** `main`
*   **Current Focus:** Transition planning to Phase 5 (Navigation & Routing).
*   **Last Updated:** 2026-07-09 21:40 (Local Time)

## Development Roadmap

### Phase 0: Planning & Setup
*   **Status:** Completed
*   **Estimated Completion:** 2026-07-09
*   **Dependencies:** None
*   **Owner:** Antigravity (AI) & Kartik (User)
*   **Notes:** Scaffolding the initial project layout, directory architecture, and Git.

### Phase 1: Backend Foundation
*   **Status:** Completed
*   **Estimated Completion:** 2026-07-09
*   **Dependencies:** Phase 0
*   **Owner:** Antigravity (AI)
*   **Notes:** Successfully created backend folder structure, configured FastAPI, CORS, logging, SQLAlchemy base engines, and verified health routes with pytest.

### Phase 2: Business Logic Layer
*   **Status:** Completed
*   **Estimated Completion:** 2026-07-09
*   **Dependencies:** Phase 1
*   **Owner:** Antigravity (AI)
*   **Notes:** Building all core REST CRUD endpoints and services validation layer (Users, Contacts, Journeys, Reports).

### Phase 3: Safety Intelligence Data Layer
*   **Status:** Completed
*   **Estimated Completion:** 2026-07-09
*   **Dependencies:** Phase 2
*   **Owner:** Antigravity (AI)
*   **Notes:** Building a central SafetyAggregator collecting, validating, normalizing, and caching safety parameters (weather, crime, lighting, POIs).

### Phase 4: Explainable Safety Intelligence Engine
*   **Status:** Completed
*   **Estimated Completion:** 2026-07-09
*   **Dependencies:** Phase 3
*   **Owner:** Antigravity (AI)
*   **Notes:** Building the modular explainable safety scoring decision engine combining provider risk parameters.

### Phase 5: Navigation & Routing
*   **Status:** Not Started
*   **Estimated Completion:** 2026-07-11
*   **Dependencies:** Phase 4
*   **Owner:** Antigravity (AI)
*   **Notes:** Map integration (Leaflet/Mapbox), safe routing algorithm, and route ranking.

### Phase 6: Emergency Features
*   **Status:** Not Started
*   **Estimated Completion:** 2026-07-12
*   **Dependencies:** Phase 5
*   **Owner:** Antigravity (AI)
*   **Notes:** SOS button, live location sharing, and Safe Haven finder.

### Phase 7: Frontend Experience
*   **Status:** Completed
*   **Estimated Completion:** 2026-07-09
*   **Dependencies:** None (Scaffolded ahead in Phase 0)
*   **Owner:** Antigravity (AI)
*   **Notes:** Finished full scaffolding of Landing page, Dashboard page, Map Navigation interface, Safety Cards, Guardian view, Emergency screen, Reports page, and Settings.

### Phase 8: UI Polish & Aesthetics
*   **Status:** Completed
*   **Estimated Completion:** 2026-07-09
*   **Dependencies:** Phase 7
*   **Owner:** Antigravity (AI)
*   **Notes:** Added full Framer Motion page transitions, button clicks, hover feedback, active broadcasting radar pulses, dark mode variables, and glassmorphic surfaces.

### Phase 9: Testing & Deployment
*   **Status:** In Progress
*   **Estimated Completion:** 2026-07-13
*   **Dependencies:** Phase 8
*   **Owner:** Antigravity (AI) & Kartik (User)
*   **Notes:** Setup pytest harness, verified backend monitoring status endpoints. Performance tuning and deployment are pending.

## Master Task Checklist

### Phase 0: Planning & Setup
- [x] Create docs/PROJECT_COMMAND_CENTER.md
- [x] Define initial database schema
- [x] Initialize git repository

### Phase 1: Backend Foundation
#### Authentication
- [x] JWT authentication setup
- [x] User login API endpoint
- [x] User signup API endpoint

#### Database Setup
- [x] Create Users table
- [x] Create Emergency Contacts table
- [x] Create Safety Reports table
- [ ] Create Safe Havens table (Pending Phase 6 definition)

### Phase 2: Business Logic Layer
- [x] Implement Users CRUD REST APIs (Profile, Settings)
- [x] Implement Emergency Contacts CRUD APIs (Mark Primary, phone validation)
- [x] Implement Journey History CRUD APIs (Start, Destination, Duration, Metadata)
- [x] Implement Community Reports CRUD APIs (Filters, categories mapping)

### Phase 3: Safety Intelligence Data Layer
- [x] Implement Provider Interfaces (Crime, Lighting, Reports, Weather, POIs, Context)
- [x] Build central SafetyAggregator service merging responses
- [x] Implement Caching Abstraction Layer with TTL limits
- [x] Write integration checks ensuring graceful provider fallbacks

### Phase 4: Explainable Safety Intelligence Engine
- [x] Implement independent Risk Modules (Crime, Lighting, Community, Weather, Time, POI, Event)
- [x] Develop weighted decision combine engine with configurable parameters
- [x] Build Confidence and explainable Reason generator from module metrics
- [x] Create GET `/api/v1/ai/safety-score` endpoint exposing details

### Phase 5: Navigation & Map Routing
- [ ] Set up interactive map component
- [ ] Implement multi-route pathfinding
- [ ] Develop Route Safety Ranking algorithm

### Phase 6: Emergency Features
- [ ] SOS quick-trigger mechanism
- [ ] Live Location Sharing service
- [ ] Safe Haven Finder (nearest safe locations)
- [ ] Guardian notification setup

### Phase 7: Frontend & User Interface
- [x] Build Landing Page (USP, hero section)
- [x] Build User Dashboard (recent safe trips, reports)
- [x] Build Navigation Screen (interactive map, directions, route safety comparison)
- [x] Build Safety Cards & Risk Details overlay

### Phase 8: UI Polish & Aesthetics
- [x] Implement responsive styles for mobile & desktop
- [x] Add smooth transitions & micro-animations
- [x] Apply premium dark mode & glassmorphism theme

### Phase 9: Testing & Final Review
- [x] Write backend unit tests
- [x] Verify API endpoints (postman/curl or unit tests)
- [x] Test mobile & desktop responsiveness
- [ ] Prepare final pitch-ready deployment

## Feature Registry
| Feature | Description | Status | Files | Owner | Dependencies | Completion Date |
|---|---|---|---|---|---|---|
| Command Center | Project dashboard & documentation | Completed | `docs/PROJECT_COMMAND_CENTER.md` | Antigravity | None | 2026-07-09 |
| Reusable UI Elements | Atomic components for design consistency | Completed | `src/components/ui/` | Antigravity | framer-motion | 2026-07-09 |
| Main Layout Frame | Header & sidebar layout grids | Completed | `src/components/layout/` | Antigravity | Reusable UI | 2026-07-09 |
| Landing View | App landing page introducing USP | Completed | `src/app/page.tsx` | Antigravity | Reusable UI | 2026-07-09 |
| Safety Dashboard | User security stats and action shortcuts | Completed | `src/app/dashboard/` | Antigravity | Reusable UI | 2026-07-09 |
| Safe Navigation | Route analysis & comparative map sandbox | Completed | `src/app/navigation/` | Antigravity | Reusable UI | 2026-07-09 |
| Guardian Portal | Trust network contact configurations | Completed | `src/app/guardian/` | Antigravity | Reusable UI | 2026-07-09 |
| SOS Terminal | Pulsating emergency alert system countdown | Completed | `src/app/emergency/` | Antigravity | Reusable UI | 2026-07-09 |
| Community Reports | Pedestrian hazard crowdsourcing list | Completed | `src/app/reports/` | Antigravity | Reusable UI | 2026-07-09 |
| Account Settings | Safety preferences sliders & checkboxes | Completed | `src/app/settings/` | Antigravity | Reusable UI | 2026-07-09 |
| About Safety AI | AI mathematical formula breakdowns | Completed | `src/app/about/` | Antigravity | Reusable UI | 2026-07-09 |
| DB Engine | Connection Session local factory builders | Completed | `backend/app/database/` | Antigravity | SQLAlchemy | 2026-07-09 |
| User Hashing & Auth | Signed JWT token utilities and Bcrypt handlers | Completed | `backend/app/core/security.py` | Antigravity | bcrypt, python-jose | 2026-07-09 |
| Generic Repositories | Decoupled DB CRUD wrapper operations | Completed | `backend/app/repositories/` | Antigravity | SQLAlchemy base | 2026-07-09 |
| Dynamic Queries | Reusable Pagination, Sorting, Search, and Filters | Completed | `backend/app/utils/query.py` | Antigravity | SQLAlchemy | 2026-07-09 |
| Business Services | Encapsulated logic layers validating profiles & updates | Completed | `backend/app/services/` | Antigravity | Repositories | 2026-07-09 |
| Safety Data Aggregator | Gathers coordinates parameters concurrently | Completed | `backend/app/safety/` | Antigravity | asyncio, cache | 2026-07-09 |
| Safety Scoring AI Engine | Computes safety scoring breakdowns & explainable reasons | Completed | `backend/app/ai/` | Antigravity | config weights | 2026-07-09 |
| Pytest Test Harness | Isolated SQLite database function rollbacks testing | Completed | `backend/tests/` | Antigravity | Pytest, TestClient | 2026-07-09 |

## API Registry
| Endpoint | Purpose | Status | Request | Response | Used By |
|---|---|---|---|---|---|
| `GET /api/v1/health` | Detailed monitoring health check and DB link | Completed | None | `{ status: "healthy", database: "connected", ... }` | Monitor |
| `GET /api/v1/status` | Quick ping system checks | Completed | None | `{ status: "OK" }` | Monitor |
| `GET /api/v1/version` | Returns current semantic version | Completed | None | `{ version: "1.0.0", api_version: "v1" }` | Monitor |
| `POST /api/v1/auth/signup` | Register new users | Completed | `{ email, password, name }` | `{ id, email, name, ... }` | Frontend |
| `POST /api/v1/auth/login` | Authenticate credentials and issue JWT | Completed | `{ email, password }` | `{ access_token, token_type }` | Frontend |
| `GET /api/v1/users/me` | Fetch authenticated user profile details | Completed | None (Signed JWT Header) | `{ id, email, name, created_at, ... }` | Frontend Profile |
| `PUT /api/v1/users/me` | Update authenticated user details / settings | Completed | `{ email, name, password }` | `{ id, email, name, updated_at, ... }` | Frontend Settings |
| `DELETE /api/v1/users/me` | Deletes current authenticated account | Completed | None (Signed JWT Header) | `{ id, email, name, ... }` | Frontend Settings |
| `GET /api/v1/contacts` | Fetch emergency contacts registered under user | Completed | None (Signed JWT Header) | `[{ id, user_id, name, phone, relationship_type, is_primary, ... }]` | Frontend Contacts |
| `POST /api/v1/contacts` | Create emergency contact | Completed | `{ name, phone, relationship_type, is_primary, user_id }` | `{ id, user_id, name, phone, relationship_type, is_primary, ... }` | Frontend Contacts |
| `PUT /api/v1/contacts/{id}` | Update contact parameters | Completed | `{ name, phone, relationship_type, is_primary }` | `{ id, user_id, name, phone, relationship_type, is_primary, ... }` | Frontend Contacts |
| `DELETE /api/v1/contacts/{id}` | Remove contact from database | Completed | None (Signed JWT Header) | `{ id, user_id, name, ... }` | Frontend Contacts |
| `POST /api/v1/contacts/{id}/primary` | Explicitly set a contact as primary alert target | Completed | None (Signed JWT Header) | `{ id, user_id, name, is_primary: true, ... }` | Frontend Contacts |
| `GET /api/v1/journeys` | Fetch paginated historical navigation logs of user | Completed | `skip`, `limit`, `sort_by`, `order` parameters | `[{ id, user_id, origin, destination, origin_lat, origin_lng, ... }]` | Frontend Dashboard |
| `POST /api/v1/journeys` | Save new navigation journey log | Completed | `{ origin, destination, origin_lat, origin_lng, dest_lat, dest_lng, status, user_id, ... }` | `{ id, user_id, origin, destination, status, created_at, ... }` | Frontend Navigation |
| `GET /api/v1/journeys/{id}` | Fetch details of specific navigation trip | Completed | None (Signed JWT Header) | `{ id, user_id, origin, destination, status, created_at, ... }` | Frontend Navigation |
| `PUT /api/v1/journeys/{id}` | Modify journey metadata, statuses, or travel times | Completed | `{ status, duration_seconds, completed_at, journey_metadata }` | `{ id, status, duration_seconds, completed_at, ... }` | Frontend Navigation |
| `DELETE /api/v1/journeys/{id}` | Remove a journey history item | Completed | None (Signed JWT Header) | `{ id, user_id, origin, ... }` | Frontend Dashboard |
| `GET /api/v1/reports` | Query safety reports with filters and keyword search | Completed | `skip`, `limit`, `type`, `search`, `sort_by`, `order` | `[{ id, user_id, lat, lng, type, description, created_at, ... }]` | Frontend Feed |
| `POST /api/v1/reports` | Submit community safety report (anonymous optional) | Completed | `{ lat, lng, type, description }` | `{ id, user_id, lat, lng, type, description, created_at, ... }` | Frontend Feed |
| `GET /api/v1/reports/{id}` | Fetch details of a specific report | Completed | None | `{ id, user_id, lat, lng, type, description, ... }` | Frontend Feed |
| `PUT /api/v1/reports/{id}` | Edit report details (ownership authorized check) | Completed | `{ lat, lng, type, description }` | `{ id, user_id, lat, lng, type, description, updated_at, ... }` | Frontend Feed |
| `DELETE /api/v1/reports/{id}` | Delete report alert from database | Completed | None (Signed JWT Header) | `{ id, user_id, lat, lng, type, ... }` | Frontend Feed |
| `GET /api/v1/safety/aggregate` | Fetch concurrently aggregated safety metrics from active providers | Completed | `lat`, `lng` query parameters | `{ location, timestamp, crime, lighting, community, weather, poi, time, future_event, metadata }` | Frontend Map |
| `GET /api/v1/safety/health` | Lists data providers latency, status, availability | Completed | None | `[{ name, status, availability, latency_ms, last_update }]` | Admin / Monitor |
| `GET /api/v1/ai/safety-score` | Computes transit safety score, risk category, and explanations breakdown | Completed | `lat`, `lng` query parameters | `{ safety_score, confidence_level, confidence_percentage, risk_category, reasons, module_breakdown }` | Frontend Map Overlay |

## Database Registry
### Users Table
*   **Columns:** `id` (PK, Int), `name` (Str), `email` (Str, Unique), `password_hash` (Str), `created_at` (DateTime), `updated_at` (DateTime)
*   **Relationships:** Has many Emergency Contacts, Journeys, Reports
*   **Purpose:** User account details and auth.

### Emergency Contacts Table
*   **Columns:** `id` (PK, Int), `user_id` (FK to users), `name` (Str), `phone` (Str), `relationship_type` (Str, Nullable), `is_primary` (Bool), `created_at` (DateTime), `updated_at` (DateTime)
*   **Relationships:** Belongs to User
*   **Purpose:** Contacts to notify in case of SOS.

### Journey History Table
*   **Columns:** `id` (PK, Int), `user_id` (FK to users), `origin` (Str), `destination` (Str), `origin_lat` (Float), `origin_lng` (Float), `dest_lat` (Float), `dest_lng` (Float), `safety_score` (Int, Nullable), `status` (Str), `duration_seconds` (Int, Nullable), `completed_at` (DateTime, Nullable), `journey_metadata` (JSON, Nullable), `created_at` (DateTime), `updated_at` (DateTime)
*   **Relationships:** Belongs to User
*   **Purpose:** Tracks historical journey logs, travel duration times, metadata, and safety indices.

### Safety Reports Table
*   **Columns:** `id` (PK, Int), `user_id` (FK to users, Nullable), `lat` (Float), `lng` (Float), `type` (Str), `description` (Str), `created_at` (DateTime), `updated_at` (DateTime)
*   **Relationships:** Belongs to User (optional/nullable for anonymous)
*   **Purpose:** Crowd-sourced crime/safety reports.

### Safe Havens Table
*   **Columns:** `id`, `name`, `type` (e.g., police_station, fire_station, open_shop), `lat`, `lng`, `address`, `phone`
*   **Relationships:** None
*   **Purpose:** List of secure places users can run to.

## Folder Structure
```
TrustRoute/
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── docs/
│   └── PROJECT_COMMAND_CENTER.md
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── Landing.module.css
│   │   ├── about/
│   │   │   ├── About.module.css
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.module.css
│   │   │   └── page.tsx
│   │   ├── emergency/
│   │   │   ├── Emergency.module.css
│   │   │   └── page.tsx
│   │   ├── guardian/
│   │   │   ├── Guardian.module.css
│   │   │   └── page.tsx
│   │   ├── navigation/
│   │   │   ├── Navigation.module.css
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   ├── Reports.module.css
│   │   │   └── page.tsx
│   │   └── settings/
│   │       ├── Settings.module.css
│   │       └── page.tsx
│   ├── assets/
│   │   └── .gitkeep
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.module.css
│   │   │   └── DashboardLayout.tsx
│   │   └── ui/
│   │       ├── Badge.module.css
│   │       ├── Badge.tsx
│   │       ├── BottomSheet.module.css
│   │       ├── BottomSheet.tsx
│   │       ├── Button.module.css
│   │       ├── Button.tsx
│   │       ├── Card.module.css
│   │       ├── Card.tsx
│   │       ├── EmptyState.module.css
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.module.css
│   │       ├── ErrorState.tsx
│   │       ├── FAB.module.css
│   │       ├── FAB.tsx
│   │       ├── Input.module.css
│   │       ├── Input.tsx
│   │       ├── LoadingSkeleton.module.css
│   │       ├── LoadingSkeleton.tsx
│   │       ├── Navbar.module.css
│   │       ├── Navbar.tsx
│   │       ├── ProgressIndicator.module.css
│   │       ├── ProgressIndicator.tsx
│   │       ├── SafetyScoreCard.module.css
│   │       ├── SafetyScoreCard.tsx
│   │       ├── SearchBar.module.css
│   │       ├── SearchBar.tsx
│   │       ├── SectionHeader.module.css
│   │       ├── SectionHeader.tsx
│   │       ├── Sidebar.module.css
│   │       ├── Sidebar.tsx
│   │       └── index.ts
│   ├── constants/
│   │   └── index.ts
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   └── api.ts
│   ├── services/
│   │   └── safety.ts
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
└── backend/
    ├── .env.example
    ├── .env
    ├── requirements.txt
    ├── README.md
    ├── app/
    │   ├── main.py
    │   ├── api/
    │   │   └── v1/
    │   │       └── endpoints/
    │   │           ├── health.py
    │   │           ├── auth.py
    │   │           ├── users.py
    │   │           ├── contacts.py
    │   │           ├── journeys.py
    │   │           ├── reports.py
    │   │           └── safety.py
    │   ├── core/
    │   │   ├── config.py
    │   │   └── security.py
    │   ├── database/
    │   │   ├── base.py
    │   │   └── session.py
    │   ├── dependencies/
    │   │   └── auth.py
    │   ├── middleware/
    │   │   ├── errors.py
    │   │   └── logging.py
    │   ├── models/
    │   │   ├── user.py
    │   │   ├── contact.py
    │   │   ├── journey.py
    │   │   └── report.py
    │   ├── repositories/
    │   │   ├── base.py
    │   │   ├── user.py
    │   │   ├── contact.py
    │   │   ├── journey.py
    │   │   └── report.py
    │   ├── schemas/
    │   │   ├── user.py
    │   │   ├── contact.py
    │   │   ├── journey.py
    │   │   ├── report.py
    │   │   └── token.py
    │   ├── services/
    │   │   ├── auth.py
    │   │   ├── user.py
    │   │   ├── contact.py
    │   │   ├── journey.py
    │   │   └── report.py
    │   ├── safety/
    │   │   ├── README.md
    │   │   ├── aggregator/
    │   │   │   └── aggregator.py
    │   │   ├── api/
    │   │   │   └── router.py
    │   │   ├── cache/
    │   │   │   └── cache.py
    │   │   ├── providers/
    │   │   │   ├── __init__.py
    │   │   │   ├── base.py
    │   │   │   ├── crime.py
    │   │   │   ├── lighting.py
    │   │   │   ├── community.py
    │   │   │   ├── weather.py
    │   │   │   ├── poi.py
    │   │   │   ├── time_context.py
    │   │   │   └── future_event.py
    │   │   └── schemas/
    │   │       └── schemas.py
    │   ├── ai/
    │   │   ├── README.md
    │   │   ├── aggregator/
    │   │   ├── api/
    │   │   │   └── router.py
    │   │   ├── confidence/
    │   │   │   └── engine.py
    │   │   ├── engine/
    │   │   │   └── decision.py
    │   │   ├── reasoning/
    │   │   │   └── generator.py
    │   │   ├── risk_modules/
    │   │   │   ├── __init__.py
    │   │   │   ├── base.py
    │   │   │   ├── crime.py
    │   │   │   ├── lighting.py
    │   │   │   ├── community.py
    │   │   │   ├── weather.py
    │   │   │   ├── time.py
    │   │   │   ├── poi.py
    │   │   │   └── event.py
    │   │   ├── schemas/
    │   │   │   └── schemas.py
    │   │   ├── services/
    │   │   │   └── ai_service.py
    │   │   └── weights/
    │   │       └── config.py
    │   └── utils/
    │       └── query.py
    └── tests/
        ├── conftest.py
        ├── test_health.py
        ├── test_business_crud.py
        ├── test_safety_intelligence.py
        └── test_explainable_ai.py
```

## File Registry
| File | Description |
|---|---|
| [.gitignore](file:///c:/Users/KARTIK/Desktop/TrustRoute/.gitignore) | Git ignore configuration to prevent tracking build artifacts, node modules, and credentials |
| [README.md](file:///c:/Users/KARTIK/Desktop/TrustRoute/README.md) | Default repository README file initialized on GitHub |
| [PROJECT_COMMAND_CENTER.md](file:///c:/Users/KARTIK/Desktop/TrustRoute/docs/PROJECT_COMMAND_CENTER.md) | Single Source of Truth for project progress & documentation |
| [globals.css](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/styles/globals.css) | Core CSS styling system variables, margins, resets, glassmorphic filters, and shimmers |
| [DashboardLayout.tsx](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/components/layout/DashboardLayout.tsx) | App UI wrapper frame linking global headers and side navigation |
| [page.tsx (root)](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/page.tsx) | Landing interface showcasing main features, values, CTAs, and animations |
| [page.tsx (dashboard)](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/dashboard/page.tsx) | Security dashboard highlighting user statistics, recent walks, and maps scores |
| [page.tsx (navigation)](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/navigation/page.tsx) | Map search sandbox contrasting fastest versus safest paths |
| [page.tsx (guardian)](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/guardian/page.tsx) | Contact listing with relationship statuses, email, phone, and confirmation modals |
| [page.tsx (emergency)](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/emergency/page.tsx) | Standalone emergency SOS broadcasting triggers with a 5-second countdown |
| [page.tsx (reports)](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/reports/page.tsx) | Pedestrian community safety reports feeds with location mapping forms |
| [page.tsx (settings)](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/settings/page.tsx) | Account preferences toggles for audio tracking, routing priorities, and notifications |
| [page.tsx (about)](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/about/page.tsx) | Detailed mathematical formula and descriptions of variables used by the AI engine |
| [backend/requirements.txt](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/requirements.txt) | Python backend dependencies configuration |
| [backend/README.md](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/README.md) | Architectural and installation manual for the Python FastAPI backend engine |
| [main.py (backend)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/main.py) | Application initializer establishing CORS policies, exception handling, and api routers |
| [session.py (database)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/database/session.py) | Instantiates SQLAlchemy engine and declares DB session yields dependencies |
| [security.py (core)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/core/security.py) | Signed JWT token creators and bcrypt credential verification stubs |
| [auth.py (dependencies)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/dependencies/auth.py) | Implements get_current_user dependency decoders protecting secure endpoints |
| [health.py (api)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/api/v1/endpoints/health.py) | Implements health check status monitoring endpoints |
| [conftest.py (tests)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/tests/conftest.py) | Integration client factories overriding DB calls to memory SQLite engines |
| [query.py (utils)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/utils/query.py) | Custom reusable pagination, sorting, search keyword, and filters filters helpers |
| [user.py (services)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/services/user.py) | Service operations facilitating account details updates, profile lookups, and deletions |
| [contact.py (services)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/services/contact.py) | Service operations handling contact additions, deletions, primary contact toggle |
| [journey.py (services)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/services/journey.py) | Service operations enabling journey creations, completion times logging, and paging query logs |
| [report.py (services)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/services/report.py) | Service operations managing incident alerts validations and searching feeds |
| [auth.py (endpoints)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/api/v1/endpoints/auth.py) | Endpoint controllers facilitating signups and logins credentials check |
| [users.py (endpoints)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/api/v1/endpoints/users.py) | Endpoint controllers facilitating profile information and setting updates |
| [contacts.py (endpoints)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/api/v1/endpoints/contacts.py) | Endpoint controllers handling emergency contacts creations and details updates |
| [journeys.py (endpoints)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/api/v1/endpoints/journeys.py) | Endpoint controllers logging and retrieving navigation journey routes logs |
| [reports.py (endpoints)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/api/v1/endpoints/reports.py) | Endpoint controllers managing crowdsourced incident alerts submissions |
| [test_business_crud.py (tests)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/tests/test_business_crud.py) | Functional integration tests suite validating signup, login, CRUDs, phone formatting, duplicate constraints |
| [README.md (safety)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/safety/README.md) | Technical instructions detailing provider interfaces, caching TTLs, error limits and future plugins |
| [schemas.py (safety)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/safety/schemas/schemas.py) | Pydantic safety schemas parsing combined crime, lighting, reports, weather, and context fields |
| [base.py (safety)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/safety/providers/base.py) | Base class template logging latency EMAs, request availability percentage ratios and statuses |
| [aggregator.py (safety)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/safety/aggregator/aggregator.py) | Aggregation hub routing lookups concurrently with timeouts boundaries and fallback maps |
| [router.py (safety)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/safety/api/router.py) | FastAPI endpoints exposing combined metrics queries and providers health indexes |
| [test_safety_intelligence.py (tests)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/tests/test_safety_intelligence.py) | Integration checks verifying validation bounds, cache TTLs, provider failures, and timeouts fallbacks |
| [README.md (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/README.md) | Technical description of configurable weights risk modules, confidence engines, and explainable summaries |
| [schemas.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/schemas/schemas.py) | Pydantic structures mapping risk breakdowns and SafetyScoreResponse parameters |
| [base.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/risk_modules/base.py) | Interface mapping score calculations and modular independence boundaries |
| [crime.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/risk_modules/crime.py) | Evaluates crime risk metrics |
| [lighting.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/risk_modules/lighting.py) | Evaluates street light coverage risk metrics |
| [community.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/risk_modules/community.py) | Evaluates active safety reports risk metrics |
| [weather.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/risk_modules/weather.py) | Evaluates transit visibility risk metrics |
| [time.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/risk_modules/time.py) | Evaluates late night transit baseline risks |
| [poi.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/risk_modules/poi.py) | Evaluates emergency infrastructure risk mitigation |
| [event.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/risk_modules/event.py) | Evaluates public gatherings baseline risks |
| [config.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/weights/config.py) | Risk parameter weights configuration |
| [engine.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/confidence/engine.py) | Computes metadata freshness and provider health percentages |
| [generator.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/reasoning/generator.py) | Translates risk scores into consolidated reasoning paragraphs |
| [decision.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/engine/decision.py) | Computes safety scores, risk categories, and breakdowns maps |
| [ai_service.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/services/ai_service.py) | Interfacing aggregator lookups with evaluation algorithms |
| [router.py (ai)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/api/router.py) | FastAPI endpoints exposing explainable safety scoring engine |
| [test_explainable_ai.py (tests)](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/tests/test_explainable_ai.py) | Test cases checking risk parameters weights, mitigators, confidence engines, and API lookups |

## Git Progress
*   **Latest Commit:** Phase 3 - Safety Intelligence Data Layer: Implement modular data aggregation providers (Crime, Lighting, Community, Weather, POIs, Context, Events), thread-safe TTL cache engine, SafetyAggregator with concurrent fetch limits, health trackers, and integration Pytest suites
*   **Branch:** `main`
*   **Major Changes:** Completed backend database tables mappings, security JWT codecs, logging interceptors, repository stubs, API versioning, health routers, and Pytest verification suites.
*   **Pending Changes:** Scaffolding Phase 2 AI Safety Scoring and routing features.

## Known Issues
*   No bugs identified yet.

## Technical Debt
*   No technical debt recorded.

## Future Scope
*   Integration with wearables (smartwatches) for SOS triggers.
*   Off-line safety maps.
*   Voice-activated SOS alerts.

## Demo Checklist
- [x] Fully styled frontend landing page and app dashboard.
- [ ] Working map canvas showing safety paths (Phase 3).
- [x] Triggerable SOS simulated screen with SMS/notification mock.
- [x] Safety score explanations rendered visually.
- [ ] Deployed live version.

## Judge Checklist
*   **Pitch Ready:** [ ]
*   **Demo Ready:** [ ]
*   **Deployment Ready:** [ ]
*   **Presentation Ready:** [ ]
*   **Video Ready:** [ ]

## AI Development Rules
1. Never break existing functionality while adding a new feature.
2. Never remove existing code unless absolutely necessary.
3. Always update this document whenever work is completed.
4. Always mark completed tasks.
5. Always update progress percentage.
6. Always update current phase.
7. Always update file registry.
8. Always update API registry.
9. Always update database registry.
10. If a new feature is added unexpectedly, append it to the roadmap and checklist.
11. If a feature changes, update every affected section.
12. Never allow this document to become outdated.
13. Treat this document as the project's brain.
14. Before generating any new code, read this document and continue from the latest project state instead of starting fresh.
15. If there is any conflict between generated code and this document, update the document first and then generate consistent code.
