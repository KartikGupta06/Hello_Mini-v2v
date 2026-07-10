from datetime import datetime, time
from typing import Dict, Any

class TimeRiskAnalyzer:
    def __init__(self):
        self.name = "Time Risk Analyzer"

    def evaluate(self, current_time: time = None) -> Dict[str, Any]:
        """Determines multipliers for environmental risks based on the time of day."""
        if current_time is None:
            current_time = datetime.now().time()

        # Define time bounds
        morning_start = time(6, 0)
        afternoon_start = time(12, 0)
        evening_start = time(18, 0)
        night_start = time(22, 0)

        # Classify time window and select multipliers
        if morning_start <= current_time < afternoon_start:
            window = "Morning"
            crime_mult = 1.0
            infra_mult = 0.0
        elif afternoon_start <= current_time < evening_start:
            window = "Afternoon"
            crime_mult = 1.0
            infra_mult = 0.0
        elif evening_start <= current_time < night_start:
            window = "Evening"
            crime_mult = 1.5
            infra_mult = 1.0
        else:
            window = "Night"
            crime_mult = 2.0
            infra_mult = 3.0

        reasons = [f"Contextual window: {window} transit context selected (Crime mult: {crime_mult}x, Infrastructure mult: {infra_mult}x)."]

        return {
            "time_window": window,
            "crime_multiplier": crime_mult,
            "infrastructure_multiplier": infra_mult,
            "reasons": reasons,
            "metadata": {
                "evaluated_time": current_time.strftime("%H:%M:%S")
            }
        }
