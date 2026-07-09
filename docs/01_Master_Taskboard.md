# SafeRoute AI

## Project Vision
*   **Problem Statement:** Conventional navigation systems optimize strictly for speed and distance, frequently routing pedestrians, night workers, tourists, and vulnerable individuals through poorly lit, high-crime, or isolated areas.
*   **Solution:** SafeRoute AI is an intelligent navigation companion that computes paths based on safety metrics, combining crowdsourced incident reports, historical crime data, street lighting levels, and infrastructure quality.
*   **USP (Unique Selling Proposition):** Real-time AI-powered Safety Scoring with natural language explanation of risk factors, dynamic rerouting during emergencies, and instant safe-haven routing.
*   **Target Users:** Women, night-shift employees, students, tourists, and outdoor runners.
*   **Hackathon Objective:** Deliver a fully functional web-based prototype featuring map navigation, safety route alternatives, safety score explanations, emergency SOS triggers, and live location updates.

## Overall Progress
**Completion:** 4%

```
████░░░░░░░░░░░░░░░░ (4%)
```

## Current Phase
*   **Current Phase:** Phase 0: Planning & Setup
*   **Current Objective:** Initialize project structure, establish the Master Taskboard, and define the architecture.
*   **Current Milestone:** Project scaffolding and Git setup.
*   **Current Priority:** Setup directory structures and plan database schema.
*   **Current Branch:** `main`
*   **Current Focus:** Documentation, setup, and connecting GitHub remote.
*   **Last Updated:** 2026-07-09 20:09 (Local Time)

## Development Roadmap

### Phase 0: Planning & Setup
*   **Status:** In Progress
*   **Estimated Completion:** 2026-07-09
*   **Dependencies:** None
*   **Owner:** Antigravity (AI) & Kartik (User)
*   **Notes:** Scaffolding the initial project layout and documentation.

### Phase 1: Backend Foundation
*   **Status:** Not Started
*   **Estimated Completion:** 2026-07-10
*   **Dependencies:** Phase 0
*   **Owner:** Antigravity (AI)
*   **Notes:** Database design, user authentication, and basic CRUD API endpoints.

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
*   **Status:** Not Started
*   **Estimated Completion:** 2026-07-12
*   **Dependencies:** Phase 4
*   **Owner:** Antigravity (AI)
*   **Notes:** Landing Page, Dashboard, Map Navigation View, and Safety Cards.

### Phase 6: UI Polish & Aesthetics
*   **Status:** Not Started
*   **Estimated Completion:** 2026-07-13
*   **Dependencies:** Phase 5
*   **Owner:** Antigravity (AI)
*   **Notes:** Animations, glassmorphism UI, responsive refinement, and dark mode.

### Phase 7: Testing & Deployment
*   **Status:** Not Started
*   **Estimated Completion:** 2026-07-13
*   **Dependencies:** Phase 6
*   **Owner:** Antigravity (AI) & Kartik (User)
*   **Notes:** E2E testing, API testing, performance tuning, and deployment.

## Master Task Checklist

### Phase 0: Planning & Setup
- [x] Create docs/01_Master_Taskboard.md
- [ ] Define initial database schema
- [x] Initialize git repository

### Phase 1: Backend Foundation
#### Authentication
- [ ] JWT authentication setup
- [ ] User login API endpoint
- [ ] User signup API endpoint

#### Database Setup
- [ ] Create Users table
- [ ] Create Emergency Contacts table
- [ ] Create Safety Reports table
- [ ] Create Safe Havens table

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
- [ ] Build Landing Page (USP, hero section)
- [ ] Build User Dashboard (recent safe trips, reports)
- [ ] Build Navigation Screen (interactive map, directions, route safety comparison)
- [ ] Build Safety Cards & Risk Details overlay

### Phase 6: UI Polish & Aesthetics
- [ ] Implement responsive styles for mobile & desktop
- [ ] Add smooth transitions & micro-animations
- [ ] Apply premium dark mode & glassmorphism theme

### Phase 7: Testing & Final Review
- [ ] Write backend unit tests
- [ ] Verify API endpoints (postman/curl or unit tests)
- [ ] Test mobile & desktop responsiveness
- [ ] Prepare final pitch-ready deployment

## Feature Registry
| Feature | Description | Status | Files | Owner | Dependencies | Completion Date |
|---|---|---|---|---|---|---|
| Master Taskboard | Project dashboard & documentation | Completed | `docs/01_Master_Taskboard.md` | Antigravity | None | 2026-07-09 |

## API Registry
| Endpoint | Purpose | Status | Request | Response | Used By |
|---|---|---|---|---|---|
| `/api/auth/signup` | Register new users | Not Started | `{ email, password, name }` | `{ token, user }` | Frontend |
| `/api/auth/login` | Authenticate users | Not Started | `{ email, password }` | `{ token, user }` | Frontend |
| `/api/routes` | Get routes with safety scores | Not Started | `{ origin, destination }` | `{ routes: [...] }` | Frontend Map |
| `/api/reports` | Submit safety report | Not Started | `{ lat, lng, type, description }` | `{ report }` | Frontend |
| `/api/emergency/sos` | Trigger SOS alert | Not Started | `{ lat, lng }` | `{ status: "triggered" }` | Frontend |
| `/api/havens` | Get nearby safe havens | Not Started | `{ lat, lng }` | `{ havens: [...] }` | Frontend |

## Database Registry
### Users Table
*   **Columns:** `id`, `name`, `email`, `password_hash`, `created_at`
*   **Relationships:** Has many Emergency Contacts, Safety Reports
*   **Purpose:** User account details and auth.

### Emergency Contacts Table
*   **Columns:** `id`, `user_id`, `name`, `phone`, `relationship`, `created_at`
*   **Relationships:** Belongs to User
*   **Purpose:** Contacts to notify in case of SOS.

### Safety Reports Table
*   **Columns:** `id`, `user_id`, `lat`, `lng`, `type` (e.g., poorly-lit, theft, harassment), `description`, `created_at`
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
├── README.md
└── docs/
    └── 01_Master_Taskboard.md
```

## File Registry
| File | Description |
|---|---|
| [.gitignore](file:///c:/Users/KARTIK/Desktop/TrustRoute/.gitignore) | Git ignore configuration to prevent tracking build artifacts, node modules, and credentials |
| [README.md](file:///c:/Users/KARTIK/Desktop/TrustRoute/README.md) | Default repository README file initialized on GitHub |
| [01_Master_Taskboard.md](file:///c:/Users/KARTIK/Desktop/TrustRoute/docs/01_Master_Taskboard.md) | Single Source of Truth for project progress & documentation |

## Git Progress
*   **Latest Commit:** initial doc setup
*   **Branch:** `main`
*   **Major Changes:** Initialized git repository, added .gitignore and docs/01_Master_Taskboard.md.
*   **Pending Changes:** Define initial database schema and start scaffolding the backend and frontend.

## Known Issues
*   No bugs identified yet.

## Technical Debt
*   No technical debt recorded.

## Future Scope
*   Integration with wearables (smartwatches) for SOS triggers.
*   Off-line safety maps.
*   Voice-activated SOS alerts.

## Demo Checklist
- [ ] Fully styled frontend landing page and app dashboard.
- [ ] Working map canvas showing safety paths.
- [ ] Triggerable SOS simulated screen with SMS/notification mock.
- [ ] Safety score explanations rendered visually.
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
