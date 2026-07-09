from datetime import datetime, timezone
from typing import Dict, Tuple

class ConfidenceEngine:
    @staticmethod
    def calculate_confidence(data: dict) -> Tuple[str, float]:
        """Calculates transit safety confidence score percentage and classification tags."""
        percentage = 100.0
        
        # 1. Evaluate provider health statuses
        metadata = data.get("metadata", {})
        statuses: Dict[str, str] = metadata.get("provider_statuses", {})
        
        for provider_name, status in statuses.items():
            if status == "degraded":
                percentage -= 15.0
            elif status == "unavailable":
                percentage -= 25.0

        # 2. Check data freshness (age of aggregated logs)
        timestamp_str = data.get("timestamp")
        if timestamp_str:
            try:
                # Handle datetime or isoformat string
                if isinstance(timestamp_str, str):
                    # strip Z and parse
                    ts = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
                else:
                    ts = timestamp_str
                    
                age_seconds = (datetime.now(timezone.utc) - ts).total_seconds()
                if age_seconds > 600:  # Older than 10 minutes
                    percentage -= 10.0
                elif age_seconds > 1800:  # Older than 30 minutes
                    percentage -= 20.0
            except Exception:
                pass

        # Limit percentage range between [0, 100]
        percentage = max(0.0, min(100.0, percentage))

        # Classify thresholds
        if percentage >= 80.0:
            level = "High"
        elif percentage >= 50.0:
            level = "Medium"
        else:
            level = "Low"

        return level, percentage
