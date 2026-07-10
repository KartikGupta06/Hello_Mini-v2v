# SafeRoute AI - Frontend Documentation

This document describes the design philosophy, page inventory, and backend integrations for the SafeRoute AI frontend application.

> [!WARNING]
> **TEMPORARY DEVELOPMENT CONFIGURATION:**
> Authentication has been temporarily bypassed for hackathon development.
> This is a temporary development configuration. All pages are accessible directly, and protected API calls will gracefully fallback to local storage mock data if authentication credentials or backend connections are missing.

---

## 1. Design Philosophy

*   **Map-First Focus:** Main interaction layers overlay the dark-canvas map directly. Using absolute floating glassmorphic panels preserves screen space, minimizes layout jumps, and directs focus to coordinate paths.
*   **Mobile-First Adaptability:** The dashboard adapts smoothly across screen sizes. Sidebar elements slide out dynamically on mobile layouts, while bottom routing sheets handle layout transitions seamlessly.
*   **Trust and Safety Aesthetics:** Uses a tailored deep midnight color palette (configured in `src/styles/globals.css`) accented with neon emerald (Safety indicators) and pulsing crimson (SOS countdown alarms).

---

## 2. Dynamic Development Mode (Auth Bypass)

### How It Works
*   The global toggle `DEV_MODE = true` inside [auth.ts](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/services/auth.ts) instructs client components and helpers to bypass security checkpoints.
*   `AuthService.isAuthenticated()` returns `true` automatically, skipping redirects inside [DashboardLayout.tsx](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/components/layout/DashboardLayout.tsx).
*   `AuthService.getSavedUser()` provides a static `Demo User` (`id: 9999`, role `"user"`) to populate initials in Navbar and forms.
*   Service layers for **Journeys** and **Emergency Contacts** contain fallback try/catch gates. If the backend API throws a `401 Unauthorized` or connection error, they return interactive local storage records to ensure features remain fully interactive during presentations.
*   A global floating badge `DevModeBadge` overlays in the bottom-right corner when bypass is active.

### How to Re-enable Full Authentication
To re-enable full JWT security validation:
1. Open [auth.ts](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/services/auth.ts).
2. Change the constant value:
   ```typescript
   const DEV_MODE = false;
   ```
3. Open [api.ts](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/lib/api.ts).
4. Change the constant value:
   ```typescript
   const DEV_MODE = false;
   ```
5. All security redirection gates, login requirements, and server-side JWT verification checks will be restored instantly.

---

## 3. Core Page Registry & Hookups

### 3.1 Safety Dashboard
*   **File Location:** [dashboard/page.tsx](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/dashboard/page.tsx)
*   **Active Hookup:** Fetch user journeys from `/journeys` to compute average walk safety scores. Geolocation checks call `/api/v1/ai/safety-score` to update coordinates risk factors.
*   **Future Adaptability:** Prepared to integrate live security notification push streams.

### 3.2 Safe Navigation Map
*   **File Location:** [navigation/page.tsx](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/navigation/page.tsx)
*   **Active Hookup:** Takes coordinate arrays and posts them to `POST /api/v1/routes/analyze` to receive hotspot clusters and trade-offs recommendations. Saves initialized walks to `/journeys`.
*   **Future Adaptability:** Prepared to hook into turn-by-turn auditory alerts and GPS boundary geofencing deviation notifications.

### 3.3 Safe Havens Locator
*   **File Location:** [nearby/page.tsx](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/nearby/page.tsx)
*   **Active Hookup:** Queries `/police-stations` and `/hospitals` collections and plots them on the map.
*   **Future Adaptability:** Prepared to hook into routing curves to trace pathways directly to closest shelter during emergencies.

### 3.4 Community Hazard Feeds
*   **File Location:** [reports/page.tsx](file:///c:/Users/KARTIK/Desktop/TrustRoute/src/app/reports/page.tsx)
*   **Active Hookup:** Fetches reported feeds list `/reports` and submits new incident parameters.
*   **Future Adaptability:** Prepared to accept hazard photo uploads and enable peer validation checks.
