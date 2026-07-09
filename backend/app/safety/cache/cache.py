import threading
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

logger = logging.getLogger("safety_cache")

class SafetyCache:
    def __init__(self, default_ttl_seconds: int = 300):
        """Thread-safe TTL in-memory caching utility matching coordinates keys."""
        self._cache = {}
        self._lock = threading.Lock()
        self.default_ttl = default_ttl_seconds
        self.hits = 0
        self.misses = 0

    def get(self, lat: float, lng: float) -> Optional[Any]:
        """Resolves cache hit if rounded coordinate matches exist and are unexpired."""
        # Round to 4 decimal places (~11 meters precision)
        key = (round(lat, 4), round(lng, 4))
        now = datetime.now(timezone.utc)
        
        with self._lock:
            entry = self._cache.get(key)
            if entry:
                if entry["expire_at"] > now:
                    self.hits += 1
                    logger.info(f"Cache HIT for coordinates key: {key}")
                    return entry["value"]
                else:
                    del self._cache[key]
                    logger.info(f"Cache EXPIRED for coordinates key: {key}")
            
            self.misses += 1
            logger.info(f"Cache MISS for coordinates key: {key}")
            return None

    def set(self, lat: float, lng: float, value: Any, ttl_seconds: int = None) -> None:
        """Stores standard objects inside cache keyed by rounded coordinate."""
        key = (round(lat, 4), round(lng, 4))
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expire_at = datetime.now(timezone.utc) + timedelta(seconds=ttl)
        
        with self._lock:
            self._cache[key] = {
                "value": value, 
                "expire_at": expire_at
            }
            logger.info(f"Cache SET for coordinates key: {key} with TTL: {ttl}s")

    def clear(self) -> None:
        """Resets cache registers."""
        with self._lock:
            self._cache.clear()
            self.hits = 0
            self.misses = 0
            logger.info("Cache registry cleared.")

# Instantiates global safety cache instance
safety_cache = SafetyCache()
