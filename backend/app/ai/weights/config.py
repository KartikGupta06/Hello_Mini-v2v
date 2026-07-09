from typing import Dict

# Configurable risk weights mapping (positive risk parameters must sum to 1.0)
RISK_WEIGHTS: Dict[str, float] = {
    "Crime Risk": 0.30,
    "Lighting Risk": 0.25,
    "Community Risk": 0.15,
    "Time Risk": 0.15,
    "Weather Risk": 0.10,
    "Future Event Risk": 0.05
}

# Maximum mitigation points applied to discount overall risks
POI_MITIGATION_CAP: float = 15.0
