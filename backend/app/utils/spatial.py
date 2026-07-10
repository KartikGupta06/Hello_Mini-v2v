import math
from typing import Any, List, Tuple
from sqlalchemy.orm import Session

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Computes Haversine distance in meters between two coordinates."""
    R = 6371000.0  # Earth's radius in meters
    phi1, lambda1 = math.radians(lat1), math.radians(lng1)
    phi2, lambda2 = math.radians(lat2), math.radians(lng2)
    
    dphi = phi2 - phi1
    dlambda = lambda2 - lambda1
    
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_bounding_box(lat: float, lng: float, radius_meters: float) -> Tuple[float, float, float, float]:
    """Returns (min_lat, max_lat, min_lng, max_lng) for a bounding box of radius_meters."""
    # 1 degree of latitude is approx 111000 meters
    delta_lat = radius_meters / 111000.0
    # 1 degree of longitude is approx 111000 * cos(lat) meters
    cos_lat = math.cos(math.radians(lat))
    delta_lng = radius_meters / (111000.0 * cos_lat) if cos_lat > 0 else radius_meters / 111000.0
    
    return (
        lat - delta_lat,
        lat + delta_lat,
        lng - delta_lng,
        lng + delta_lng
    )

def query_within_radius(db: Session, model: Any, lat: float, lng: float, radius_meters: float) -> List[Tuple[Any, float]]:
    """Queries any model within a bounding box and filters precisely by Haversine distance in Python."""
    min_lat, max_lat, min_lng, max_lng = get_bounding_box(lat, lng, radius_meters)
    
    candidates = db.query(model).filter(
        model.latitude.between(min_lat, max_lat),
        model.longitude.between(min_lng, max_lng)
    ).all()
    
    results = []
    for candidate in candidates:
        dist = haversine_distance(lat, lng, candidate.latitude, candidate.longitude)
        if dist <= radius_meters:
            results.append((candidate, dist))
    return results
