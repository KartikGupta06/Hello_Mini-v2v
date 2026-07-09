import pytest
from fastapi.testclient import TestClient

from app.routing.schemas.schemas import RouteCoordinate, CandidateRouteInput, RouteAnalysisResult, RouteRankingItem
from app.routing.sampling.sampler import RouteSampler
from app.routing.analysis.analyzer import RouteAnalyzer
from app.routing.ranking.ranker import RouteRanker
from app.routing.recommendation.recommendation import RecommendationEngine


# --- COORDINATE SAMPLER TESTS ---

def test_sampler_haversine_distance():
    sampler = RouteSampler()
    c1 = RouteCoordinate(lat=40.7128, lng=-74.0060)
    c2 = RouteCoordinate(lat=40.7306, lng=-73.9352)
    dist = sampler.haversine_distance(c1, c2)
    # Approx 6.2 km (6200+ meters)
    assert 5500 < dist < 7000


def test_sampler_limits_and_spacings():
    sampler = RouteSampler()
    
    # Generate 50 points in a line
    coords = [RouteCoordinate(lat=40.0 + i*0.001, lng=-74.0) for i in range(50)]
    
    # Sample with cap 10
    sampled = sampler.sample_coordinates(coords, max_samples=10)
    
    assert len(sampled) <= 10
    assert sampled[0].lat == 40.0
    assert sampled[-1].lat == 40.0 + 49*0.001


# --- RISK HOTSPOTS DETECTION TESTS ---

@pytest.mark.anyio
async def test_hotspot_detection_sudden_drops_and_clusters():
    analyzer = RouteAnalyzer()
    
    # Short candidate path coordinates
    coords = [
        RouteCoordinate(lat=40.7128, lng=-74.0060),
        RouteCoordinate(lat=40.7138, lng=-74.0070),
        RouteCoordinate(lat=40.7148, lng=-74.0080),
        RouteCoordinate(lat=40.7158, lng=-74.0090)
    ]
    
    # Stub AIService query to return custom scores creating drops and clusters
    # Point 1: 90 (Very Safe)
    # Point 2: 40 (Risky, < 50)
    # Point 3: 35 (Risky, < 50)
    # Point 4: 90 (Very Safe)
    # Note: drop between 1 and 2 is 50 (> 25), cluster between 2 and 3 is length 2
    from unittest.mock import AsyncMock, patch
    from app.ai.schemas.schemas import SafetyScoreResponse
    
    mock_responses = [
        SafetyScoreResponse(safety_score=90.0, confidence_level="High", confidence_percentage=100.0, risk_category="Very Safe", reasons=[], module_breakdown={}),
        SafetyScoreResponse(safety_score=40.0, confidence_level="High", confidence_percentage=100.0, risk_category="Risky", reasons=[], module_breakdown={}),
        SafetyScoreResponse(safety_score=35.0, confidence_level="High", confidence_percentage=100.0, risk_category="Risky", reasons=[], module_breakdown={}),
        SafetyScoreResponse(safety_score=90.0, confidence_level="High", confidence_percentage=100.0, risk_category="Very Safe", reasons=[], module_breakdown={})
    ]
    
    with patch("app.ai.services.ai_service.AIService.get_safety_score_for_coordinates", side_effect=mock_responses):
        res = await analyzer.analyze_route("r1", "Test Route", coords, db=None)
        
        assert res.statistics.safe_segments_count == 2
        assert res.statistics.unsafe_segments_count == 2
        assert len(res.hotspots) == 2
        
        # Verify hotspot types
        types = [h.type for h in res.hotspots]
        assert "unsafe_cluster" in types
        assert "sudden_drop" in types


# --- ROUTE RANKING WEIGHTS TESTS ---

def test_route_ranker_scoring():
    ranker = RouteRanker()
    
    # Candidate inputs
    candidates = [
        CandidateRouteInput(id="r1", name="Safe Route", coordinates=[], distance_meters=1000, time_seconds=600),
        CandidateRouteInput(id="r2", name="Fast Route", coordinates=[], distance_meters=800, time_seconds=400)
    ]
    
    # Mock analysis results
    from app.routing.schemas.schemas import RouteStatistics
    
    stats_r1 = RouteStatistics(avg_safety_score=95.0, min_safety_score=90.0, max_safety_score=98.0, median_safety_score=95.0, avg_confidence=100.0, risk_distribution={}, safe_segments_count=5, unsafe_segments_count=0)
    stats_r2 = RouteStatistics(avg_safety_score=50.0, min_safety_score=20.0, max_safety_score=80.0, median_safety_score=50.0, avg_confidence=100.0, risk_distribution={}, safe_segments_count=2, unsafe_segments_count=3)
    
    analyses = [
        RouteAnalysisResult(route_id="r1", route_name="Safe Route", sampled_points_count=5, statistics=stats_r1, hotspots=[]),
        RouteAnalysisResult(route_id="r2", route_name="Fast Route", sampled_points_count=5, statistics=stats_r2, hotspots=[])
    ]
    
    ranked = ranker.rank_routes(candidates, analyses)
    
    # R1: (95 * 0.50) + (90 * 0.20) + (100 * 0.10) - (600 * 0.01) - (1000 * 0.0001) = 47.5 + 18 + 10 - 6.0 - 0.1 = 69.4
    # R2: (50 * 0.50) + (20 * 0.20) + (100 * 0.10) - (400 * 0.01) - (800 * 0.0001) = 25 + 4 + 10 - 4.0 - 0.08 = 34.92
    assert ranked[0].route_id == "r1"
    assert ranked[0].rank_score == 69.4
    assert ranked[1].route_id == "r2"
    assert ranked[1].rank_score == 34.92


# --- RECOMENDATION ENGINE COMPARISONS TESTS ---

def test_recommendation_trade_offs():
    recommender = RecommendationEngine()
    
    candidates = [
        CandidateRouteInput(id="r1", name="Safe Route", coordinates=[], distance_meters=1200, time_seconds=600),
        CandidateRouteInput(id="r2", name="Fast Route", coordinates=[], distance_meters=800, time_seconds=420)
    ]
    
    from app.routing.schemas.schemas import RouteStatistics
    stats_r1 = RouteStatistics(avg_safety_score=90.0, min_safety_score=85.0, max_safety_score=95.0, median_safety_score=90.0, avg_confidence=100.0, risk_distribution={}, safe_segments_count=5, unsafe_segments_count=0)
    stats_r2 = RouteStatistics(avg_safety_score=60.0, min_safety_score=40.0, max_safety_score=80.0, median_safety_score=60.0, avg_confidence=100.0, risk_distribution={}, safe_segments_count=2, unsafe_segments_count=3)
    
    analyses = [
        RouteAnalysisResult(route_id="r1", route_name="Safe Route", sampled_points_count=5, statistics=stats_r1, hotspots=[]),
        RouteAnalysisResult(route_id="r2", route_name="Fast Route", sampled_points_count=5, statistics=stats_r2, hotspots=[])
    ]
    
    from app.routing.schemas.schemas import RouteRankingItem
    rankings = [
        RouteRankingItem(route_id="r1", route_name="Safe Route", rank=1, rank_score=65.0, avg_safety_score=90.0, travel_time_seconds=600, travel_distance_meters=1200),
        RouteRankingItem(route_id="r2", route_name="Fast Route", rank=2, rank_score=40.0, avg_safety_score=60.0, travel_time_seconds=420, travel_distance_meters=800)
    ]
    
    rec_id, reason, trade_off = recommender.generate_recommendation(candidates, rankings, analyses)
    
    assert rec_id == "r1"
    # Time diff: 600 - 420 = 180s (3 minutes)
    # Safety diff: (90 - 60) / 60 * 100 = 50% safer
    assert "3 minute" in trade_off
    assert "50.0%" in trade_off
    assert "Safe Route" in reason


# --- API POST INTEGRATION TESTS ---

def test_api_route_analysis_and_ranking(client: TestClient):
    payload = [
        {
            "id": "r1",
            "name": "Route Alpha",
            "coordinates": [
                {"lat": 40.7128, "lng": -74.0060},
                {"lat": 40.7138, "lng": -74.0070},
                {"lat": 40.7148, "lng": -74.0080}
            ],
            "distance_meters": 1200,
            "time_seconds": 600
        },
        {
            "id": "r2",
            "name": "Route Beta",
            "coordinates": [
                {"lat": 40.7128, "lng": -74.0060},
                {"lat": 40.7158, "lng": -74.0090}
            ],
            "distance_meters": 800,
            "time_seconds": 360
        }
    ]
    
    response = client.post("/api/v1/routes/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert "recommended_route_id" in data
    assert "recommendation_reason" in data
    assert "trade_offs_summary" in data
    assert "rankings" in data
    assert len(data["rankings"]) == 2
    assert "detailed_analyses" in data
    assert len(data["detailed_analyses"]) == 2
