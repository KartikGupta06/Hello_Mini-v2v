# Explainable Safety Intelligence Engine

This module provides the deterministic safety decision scoring and explanation engine for **SafeRoute AI**. It processes aggregated safety parameters, evaluates risk modules independently, computes overall Safety Scores using configurable weights, checks data confidences, and generates explainable transit reasons.

## Directory Structure
```
backend/app/ai/
├── api/
│   └── router.py           # REST API endpoint (/ai/safety-score)
├── confidence/
│   └── engine.py           # Confidence percentage calculator
├── engine/
│   └── decision.py         # Main orchestrator scoring decision engine
├── reasoning/
│   └── generator.py        # Explainable reasons translator
├── risk_modules/
│   ├── __init__.py         # Exposes all active risk modules
│   ├── base.py             # Base abstract risk module
│   ├── crime.py            # Historical crime risk evaluator
│   ├── lighting.py         # Street lighting risk evaluator
│   ├── community.py        # Active community hazard reports risk evaluator
│   ├── weather.py          # Weather transit visibility risk evaluator
│   ├── time.py             # Night-time transit baseline risk evaluator
│   ├── poi.py              # Police/safe places mitigation discount evaluator
│   └── event.py            # Scheduled public gathering risk evaluator
├── schemas/
│   └── schemas.py          # Pydantic schemas validating responses and breakdowns
└── services/
    └── ai_service.py       # Interfacing aggregator results and scoring calculators
```

---

## 1. Risk Modules Architecture
Each risk parameter is evaluated by an independent module inheriting from [BaseRiskModule](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/risk_modules/base.py):
*   Method signature: `def evaluate(self, data: dict) -> dict` returning:
    *   `risk_score`: float (0.0 to 100.0, where 0.0 is safest and 100.0 is highest risk).
    *   `confidence`: float (0.0 to 1.0 representation of provider reliability).
    *   `reason`: str (Rule-based explainable bullet detailing evaluated states).
    *   `metadata`: dict (Module-specific context details).
*   *Resilience Constraint*: Risk modules are completely independent and never call other modules.

---

## 2. Configurable Weights System
Weights are defined dynamically in [config.py](file:///c:/Users/KARTIK/Desktop/TrustRoute/backend/app/ai/weights/config.py):
*   **Weights mapping:**
    *   `Crime Risk`: 30%
    *   `Lighting Risk`: 25%
    *   `Community Risk`: 15%
    *   `Time Risk`: 15%
    *   `Weather Risk`: 10%
    *   `Future Event Risk`: 5%
    *(Total Risk Weights sum to 1.0)*
*   **POI Mitigation cap:** Proximity to police stations and safe places acts as a risk *mitigator* (returns a negative risk score). The combined POI discount is capped at `POI_MITIGATION_CAP` (default `-15.0` points) to prevent overriding baseline transit risks entirely.

---

## 3. Decision Calculations & Flow
The decision flow executes as follows:
1.  **Module Run**: Loops through risk modules passing aggregated variables.
2.  **Weighted Sum**: Multiplies positive risk results by weights to compute raw transit risk.
3.  **Mitigation discount**: Subtracts POI mitigation scores up to the capped threshold.
    $$\text{Final Risk} = \max(0.0, \text{Raw Risk} - \min(|\text{POI Score}|, \text{Mitigation Cap}))$$
4.  **Safety Score**: Inverts risk into a Safety Index:
    $$\text{Safety Score} = 100.0 - \text{Final Risk}$$
5.  **Risk Category mapping**:
    *   `safety_score >= 85`: `Very Safe`
    *   `70-84`: `Safe`
    *   `55-69`: `Moderate`
    *   `40-54`: `Risky`
    *   `25-39`: `High Risk`
    *   `< 25`: `Critical`

---

## 4. Confidence Engine
Evaluates telemetry reliability levels:
*   **Provider Statuses**: Checks status flags from the aggregator. Subtracts 15% per degraded provider and 25% per unavailable provider from a 100% baseline.
*   **Data Freshness**: Subtracts 10% if aggregated data timestamp is older than 10 minutes, and 20% if older than 30 minutes.
*   **Level mapping**:
    *   `pct >= 80%` -> `High`
    *   `50% <= pct < 80%` -> `Medium`
    *   `pct < 50%` -> `Low`

---

## 5. Explainable Reasoning Generator
Rather than using unstructured chatbot endpoints, explanations are generated deterministically:
*   Collects explanation strings from each module.
*   Filters and prioritizes reasons: High risk warnings (scores > 30.0) are listed first, followed by mitigating safe conditions.
*   Returns a list of clear explanation bullets.
