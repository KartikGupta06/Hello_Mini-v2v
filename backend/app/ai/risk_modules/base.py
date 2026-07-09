from abc import ABC, abstractmethod

class BaseRiskModule(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def evaluate(self, data: dict) -> dict:
        """Evaluates input data to return risk score, confidence, reason, and metadata.
        
        Risk Score: 0.0 (safest) to 100.0 (highest risk)
        Confidence: 0.0 (unreliable) to 1.0 (fully reliable)
        """
        pass
