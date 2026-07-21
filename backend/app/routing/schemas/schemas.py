from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class RouteCoordinate(BaseModel):
    lat: float
    lng: float

class CandidateRouteInput(BaseModel):
    id: str
    name: str
    coordinates: List[RouteCoordinate]
    distance_meters: float
    time_seconds: float

class RouteStatistics(BaseModel):
    avg_safety_score: Optional[float]
    min_safety_score: Optional[float]
    max_safety_score: Optional[float]
    median_safety_score: Optional[float]
    avg_confidence: float
    risk_distribution: Dict[str, float]  # Percentage of points per risk category
    safe_segments_count: int
    unsafe_segments_count: int

class RouteHotspot(BaseModel):
    type: str  # unsafe_cluster or sudden_drop
    description: str
    start_index: int
    end_index: int
    coordinates: List[RouteCoordinate]

class RouteAnalysisResult(BaseModel):
    route_id: str
    route_name: str
    sampled_points_count: int
    statistics: RouteStatistics
    hotspots: List[RouteHotspot]

class RouteRankingItem(BaseModel):
    route_id: str
    route_name: str
    rank: int
    rank_score: float
    avg_safety_score: Optional[float]
    travel_time_seconds: float
    travel_distance_meters: float

class RouteRecommendationResponse(BaseModel):
    recommended_route_id: str
    recommendation_reason: str
    trade_offs_summary: str
    rankings: List[RouteRankingItem]
    detailed_analyses: List[RouteAnalysisResult]

    model_config = ConfigDict(from_attributes=True)
