# Intelligent Route Analysis Engine

This module provides the Route Intelligence Layer for **SafeRoute AI**. It evaluates entire candidate route paths (polylines), samples coordinates adaptively, gathers safety score variables, highlights risk hotspots, ranks candidates based on configurable weights, and formulates explainable trade-off recommendations.

## Directory Structure
```
backend/app/routing/
├── analysis/
│   └── analyzer.py         # Performs stats collection and hotspots checks
├── api/
│   └── router.py           # REST API POST endpoint (/routes/analyze)
├── ranking/
│   └── ranker.py           # Configurable weighted ranker
├── recommendation/
│   └── recommendation.py   # Trade-off text generator
├── sampling/
│   └── sampler.py          # Distance-based adaptive coordinate sampler
├── schemas/
│   └── schemas.py          # Pydantic schemas validating route inputs/outputs
└── services/
    └── .gitkeep            # Service layers stubs
```

---

## 1. Coordinate Sampling Engine
Polylines can range from brief walks to long paths. To balance request latency with spatial representation, the [RouteSampler](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/routing/sampling/sampler.py) processes coordinates as follows:
*   **Distance calculations**: Measures distances between coordinate points using the Haversine formula:
    $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
*   **Adaptive interval scaling**: Computes cumulative distances. If the total distance exceeds the maximum sample cap (default max 20 points), the sampler dynamically adjusts the sampling interval:
    $$\text{Interval} = \max\left(\text{Default Interval (150m)}, \frac{\text{Total Distance}}{\text{Max Samples} - 1}\right)$$
*   **Precision boundaries**: Start and destination coordinates are strictly preserved.

---

## 2. Route Safety Analyzer & Hotspots Detection
The [RouteAnalyzer](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/routing/analysis/analyzer.py) maps the sampled locations:
*   **Concurrent scoring**: Fires concurrent async queries to `AIService` for all sampled coordinates using `asyncio.gather`.
*   **Stats compilation**: Computes average safety score, minimum safety (worst segment), maximum, median, average confidence, and percentage risk distributions.
*   **Hotspot detection**:
    *   *Unsafe Clusters*: Consecutive sampled points (length $\ge 2$) with safety scores under 50.0.
    *   *Sudden Drops*: Adjacent sampled points where the safety score drops by more than 25.0 points.

---

## 3. Weighted Route Ranking
The [RouteRanker](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/routing/ranking/ranker.py) ranks paths:
$$\text{Rank Score} = (\text{Avg Safety} \times 0.50) + (\text{Min Safety} \times 0.20) + (\text{Avg Confidence} \times 0.10) - (\text{Time Penalty}) - (\text{Distance Penalty}) - (\text{Hotspot Penalty})$$
*   **Time Penalty**: travel duration $\times$ `0.01` score points per second.
*   **Distance Penalty**: travel distance $\times$ `0.0001` score points per meter.
*   **Hotspot Penalty**: detected hotspot count $\times$ `5.0` points.
Routes are sorted descending by `Rank Score` and assigned ranking indices (Rank 1 is recommended).

---

## 4. Recommendation Engine
The [RecommendationEngine](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/routing/recommendation/recommendation.py) compares candidate ranks to provide trade-offs:
*   Compares the recommended (safest) route against the fastest route by time.
*   If the safest route is also the fastest, it recommends it as optimal.
*   Otherwise, it computes exact difference values:
    *   *Time difference* in minutes.
    *   *Safety improvement* percentage:
        $$\text{Safety Improvement \%} = \frac{\text{Safest Score} - \text{Fastest Score}}{\text{Fastest Score}} \times 100$$
    *   *Explanation reasons*: Contextually checks modular breakdowns (lighting, crime, POIs) to highlight why the path is safer (e.g. "fewer risk hotspots", "better lighting and security indicators").
