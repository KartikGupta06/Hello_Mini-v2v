from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.routing.ors_service import ORSService
from app.routing.schemas.schemas import CandidateRouteInput
from app.routing.sampling.sampler import RouteSampler
from app.ai.services.safety_engine import safety_engine

class RouteIntelligenceEngine:
    def __init__(self):
        self.ors = ORSService()
        self.sampler = RouteSampler()

    async def get_intelligent_routes(
        self, 
        db: Session, 
        source_lat: float, 
        source_lng: float, 
        dest_lat: float, 
        dest_lng: float
    ) -> Dict[str, Any]:
        # 1. Get alternative routes from ORS
        candidate_routes = await self.ors.get_alternative_routes(source_lat, source_lng, dest_lat, dest_lng)
        
        # 2. Analyze each route
        analyzed_routes = []
        for route in candidate_routes:
            # Sample coordinates to prevent overloading AI engine
            sampled_points = self.sampler.sample_coordinates(route.coordinates)
            if not sampled_points:
                continue
                
            # Evaluate safety for sampled points
            point_evaluations = []
            for pt in sampled_points:
                res = safety_engine.evaluate_safety(db, pt.lat, pt.lng)
                point_evaluations.append(res)
                
            # Aggregate route metrics
            avg_safety = sum(e["safety_score"] for e in point_evaluations) / len(point_evaluations)
            avg_conf = sum(e["confidence_percentage"] for e in point_evaluations) / len(point_evaluations)
            avg_emergency = sum(e["emergency_readiness_score"] for e in point_evaluations) / len(point_evaluations)
            
            # Risk Level
            if avg_safety >= 80: risk_level = "Very Safe"
            elif avg_safety >= 60: risk_level = "Safe"
            elif avg_safety >= 40: risk_level = "Moderate"
            elif avg_safety >= 20: risk_level = "Risky"
            else: risk_level = "Dangerous"
            
            # Combine explanations (take the worst point's explanation for safety context)
            worst_pt = min(point_evaluations, key=lambda x: x["safety_score"])
            
            analyzed_routes.append({
                "route_id": route.id,
                "route_name": route.name,
                "coordinates": [{"lat": c.lat, "lng": c.lng} for c in route.coordinates],
                "distance": route.distance_meters,
                "eta": route.time_seconds,
                "safety_score": round(avg_safety, 2),
                "risk_level": risk_level,
                "confidence": round(avg_conf, 2),
                "emergency_readiness": round(avg_emergency, 2),
                "ai_explanation": worst_pt["ai_explanation"]
            })
            
        # 3. Rank Routes
        # Priority: 1. Highest Safety Score, 2. Highest Confidence, 3. Shortest ETA
        analyzed_routes.sort(key=lambda x: (
            x["safety_score"],
            x["confidence"],
            -x["eta"]  # negative ETA because larger values come first in descending sort
        ), reverse=True)
        
        # 4. Final Response
        recommended = analyzed_routes[0] if analyzed_routes else None
        alternatives = analyzed_routes[1:] if len(analyzed_routes) > 1 else []
        
        return {
            "recommended_route": recommended,
            "alternative_routes": alternatives
        }

route_intelligence_engine = RouteIntelligenceEngine()
