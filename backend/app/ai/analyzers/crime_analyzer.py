import math
from datetime import datetime, date
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.crime_record import CrimeRecord
from app.utils.spatial import query_within_radius

class CrimeAnalyzer:
    def __init__(self, radius_meters: float = 500.0, base_penalty: float = 10.0):
        self.name = "Crime Analyzer"
        self.radius_meters = radius_meters
        self.base_penalty = base_penalty

    def evaluate(self, db: Session, lat: float, lng: float, evaluation_date: date = None) -> Dict[str, Any]:
        """Calculates crime risk points based on crime records within a radius, severity, and recency."""
        if evaluation_date is None:
            evaluation_date = datetime.now().date()

        # Query crimes within 500m
        crimes_with_dist = query_within_radius(db, CrimeRecord, lat, lng, self.radius_meters)

        total_crime_risk = 0.0
        critical_count = 0
        high_count = 0
        moderate_count = 0
        reasons = []

        for crime, dist in crimes_with_dist:
            # 1. Severity Multiplier
            severity = crime.crime_severity
            if severity == "High":
                severity_mult = 3.0
                critical_count += 1
            elif severity == "Medium":
                severity_mult = 1.5
                high_count += 1
            else:
                severity_mult = 0.5
                moderate_count += 1

            # 2. Distance Decay: 1.0 at 0m, decaying linearly to 0.1 at radius limit
            dist_decay = max(0.1, 1.0 - (dist / self.radius_meters))

            # 3. Recency Decay: 1.0 if today, decay to 0.1 at 365 days, baseline 0.1 beyond
            days_old = (evaluation_date - crime.crime_date).days
            days_old = max(0, days_old)  # clamp negative days (future dates)
            recency_decay = max(0.1, 1.0 - (days_old / 365.0))

            # Calculate individual crime contribution
            contribution = self.base_penalty * severity_mult * dist_decay * recency_decay
            total_crime_risk += contribution

        # Generate rule-based reason
        incident_count = len(crimes_with_dist)
        if incident_count > 0:
            reasons.append(
                f"Detected {incident_count} historical crime incident(s) within {int(self.radius_meters)}m "
                f"({critical_count} critical, {high_count} high, {moderate_count} moderate)."
            )
        else:
            reasons.append("No recent historical crime incidents detected within this sector.")

        # Apply normalization curve to prevent unbounded score collapse
        # Asymptotic curve approaching MAX_CRIME_PENALTY
        MAX_CRIME_PENALTY = 55.0
        normalized_crime_risk = MAX_CRIME_PENALTY * (1 - math.exp(-total_crime_risk / 100.0)) if total_crime_risk > 0 else 0.0

        return {
            "crime_risk": round(normalized_crime_risk, 2),
            "raw_crime_risk": round(total_crime_risk, 2),
            "incident_count": incident_count,
            "critical_count": critical_count,
            "high_count": high_count,
            "moderate_count": moderate_count,
            "reasons": reasons,
            "metadata": {
                "radius_meters": self.radius_meters,
                "raw_incidents": [
                    {
                        "crime_id": c.crime_id,
                        "type": c.crime_type,
                        "severity": c.crime_severity,
                        "distance_m": round(d, 1),
                        "date": c.crime_date.isoformat()
                    }
                    for c, d in crimes_with_dist
                ]
            }
        }
