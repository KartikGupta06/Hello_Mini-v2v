# SafeRoute AI

## Project Vision
*   **Problem Statement:** Conventional navigation systems optimize strictly for speed and distance, frequently routing pedestrians, night workers, tourists, and vulnerable individuals through poorly lit, high-crime, or isolated areas.
*   **Solution:** SafeRoute AI is an intelligent navigation companion that computes paths based on safety metrics, combining crowdsourced incident reports, historical crime data, street lighting levels, and infrastructure quality.
*   **USP (Unique Selling Proposition):** Real-time AI-powered Safety Scoring with natural language explanation of risk factors, dynamic rerouting during emergencies, and instant safe-haven routing.
*   **Target Users:** Women, night-shift employees, students, tourists, and outdoor runners.
*   **Hackathon Objective:** Deliver a fully functional web-based prototype featuring map navigation, safety route alternatives, safety score explanations, emergency SOS triggers, and live location updates.

## Overall Progress
**Completion:** 58%

```
████████████░░░░░░░░ (58%)
```

## Current Phase
*   **Current Phase:** Phase 1: Backend Foundation (Completed)
*   **Current Objective:** Stop after backend foundation is complete. Prepare to transition to Phase 2 (AI Safety Engine).
*   **Current Milestone:** Backend infrastructure is operational and verified by Pytest suite.
*   **Current Priority:** Setup backend infrastructure.
*   **Current Branch:** `main`
*   **Current Focus:** Transition planning to Phase 2 (AI Safety Engine).
*   **Last Updated:** 2026-07-09 20:59 (Local Time)

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
*   **Notes:** Successfully created backend folder structure, configured FastAPI, CORS, custom Logging Middleware, SQLAlchemy sessions, security utils, and verified with Pytest health checks.

### Phase 2: AI Safety Engine
*   **Status:** Not Started
*   **Estimated Completion:** 2026-07-11
*   **Dependencies:** Phase 1
*   **Owner:** Antigravity (AI)
*   **Notes:** Safety Score calculation algorithm, confidence scoring, and AI explanation generation.

### Phase 3: Navigation & Routing
*   **Status:** Not Started
*   **Estimated Completion:** 2026-07-11
*   **Dependencies:** Phase 2
*   **Owner:** Antigravity (AI)
*   **Notes:** Map integration (Leaflet/Mapbox), safe routing algorithm, and route ranking.

### Phase 4: Emergency Features
*   **Status:** Not Started
*   **Estimated Completion:** 2026-07-12
*   **Dependencies:** Phase 3
*   **Owner:** Antigravity (AI)
*   **Notes:** SOS button, live location sharing, and Safe Haven finder.

### Phase 5: Frontend Experience
*   **Status:** Completed
*   **Estimated Completion:** 2026-07-09
*   **Dependencies:** None (Scaffolded ahead in Phase 0)
*   **Owner:** Antigravity (AI)
*   **Notes:** Finished full scaffolding of Landing page, Dashboard page, Map Navigation interface, Safety Cards, Guardian view, Emergency screen, Reports page, and Settings.

### Phase 6: UI Polish & Aesthetics
*   **Status:** Completed
*   **Estimated Completion:** 2026-07-09
*   **Dependencies:** Phase 5
*   **Owner:** Antigravity (AI)
*   **Notes:** Added full Framer Motion page transitions, button clicks, hover feedback, active broadcasting radar pulses, dark mode variables, and glassmorphic surfaces.

### Phase 7: Testing & Deployment
*   **Status:** In Progress
*   **Estimated Completion:** 2026-07-13
*   **Dependencies:** Phase 6
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
- [ ] Create Safe Havens table (Pending Phase 4 definition)

### Phase 2: AI Safety Engine
- [ ] Develop Safety Score calculation logic
- [ ] Create AI explanation generator (Mock/OpenAI/Gemini API integration)
- [ ] Build Confidence Score generator

### Phase 3: Navigation & Map Routing
- [ ] Set up interactive map component
- [ ] Implement multi-route pathfinding
- [ ] Develop Route Safety Ranking algorithm

### Phase 4: Emergency Features
- [ ] SOS quick-trigger mechanism
- [ ] Live Location Sharing service
- [ ] Safe Haven Finder (nearest safe locations)
- [ ] Guardian notification setup

### Phase 5: Frontend & User Interface
- [x] Build Landing Page (USP, hero section)
- [x] Build User Dashboard (recent safe trips, reports)
- [x] Build Navigation Screen (interactive map, directions, route safety comparison)
- [x] Build Safety Cards & Risk Details overlay

### Phase 6: UI Polish & Aesthetics
- [x] Implement responsive styles for mobile & desktop
- [x] Add smooth transitions & micro-animations
- [x] Apply premium dark mode & glassmorphism theme

### Phase 7: Testing & Final Review
- [x] Write backend unit tests
- [x] Verify API endpoints (postman/curl or unit tests)
- [ ] Test mobile & desktop responsiveness
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
| User Hashing & Auth | Signed JWT token utilities and Bcrypt handlers | Completed | `backend/app/core/security.py` | Antigravity | passlib, python-jose | 2026-07-09 |
| Generic Repositories | Decoupled DB CRUD wrapper operations | Completed | `backend/app/repositories/` | Antigravity | SQLAlchemy base | 2026-07-09 |
| Pytest Test Harness | Isolated SQLite database function rollbacks testing | Completed | `backend/tests/` | Antigravity | Pytest, TestClient | 2026-07-09 |

## API Registry
| Endpoint | Purpose | Status | Request | Response | Used By |
|---|---|---|---|---|---|
| `GET /api/v1/health` | Detailed monitoring health check and DB link | Completed | None | `{ status: "healthy", database: "connected", ... }` | Monitor |
| `GET /api/v1/status` | Quick ping system checks | Completed | None | `{ status: "OK" }` | Monitor |
| `GET /api/v1/version` | Returns current semantic version | Completed | None | `{ version: "1.0.0", api_version: "v1" }` | Monitor |
| `/api/auth/signup` | Register new users | Not Started | `{ email, password, name }` | `{ token, user }` | Frontend |
| `/api/auth/login` | Authenticate users | Not Started | `{ email, password }` | `{ token, user }` | Frontend |
| `/api/routes` | Get routes with safety scores | Not Started | `{ origin, destination }` | `{ routes: [...] }` | Frontend Map |
| `/api/reports` | Submit safety report | Not Started | `{ lat, lng, type, description }` | `{ report }` | Frontend |
| `/api/emergency/sos` | Trigger SOS alert | Not Started | `{ lat, lng }` | `{ status: "triggered" }` | Frontend |
| `/api/havens` | Get nearby safe havens | Not Started | `{ lat, lng }` | `{ havens: [...] }` | Frontend |

## Database Registry
### Users Table
*   **Columns:** `id` (PK, Int), `name` (Str), `email` (Str, Unique), `password_hash` (Str), `created_at` (DateTime)
*   **Relationships:** Has many Emergency Contacts, Journeys, Reports
*   **Purpose:** User account details and auth.

### Emergency Contacts Table
*   **Columns:** `id` (PK, Int), `user_id` (FK to users), `name` (Str), `phone` (Str), `relationship` (Str, Nullable), `created_at` (DateTime)
*   **Relationships:** Belongs to User
*   **Purpose:** Contacts to notify in case of SOS.

### Journey History Table
*   **Columns:** `id` (PK, Int), `user_id` (FK to users), `origin` (Str), `destination` (Str), `origin_lat` (Float), `origin_lng` (Float), `dest_lat` (Float), `dest_lng` (Float), `safety_score` (Int, Nullable), `status` (Str), `created_at` (DateTime)
*   **Relationships:** Belongs to User
*   **Purpose:** Tracks historical journey logs and safety indices.

### Safety Reports Table
*   **Columns:** `id` (PK, Int), `user_id` (FK to users, Nullable), `lat` (Float), `lng` (Float), `type` (Str), `description` (Str), `created_at` (DateTime)
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
    │   │           └── health.py
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
    │   └── services/
    │       └── auth.py
    └── tests/
        ├── conftest.py
        └── test_health.py
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

## Git Progress
*   **Latest Commit:** Phase 0 - Project Foundation: Scaffold folder structure, reusable UI components, styling tokens, and pages
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
