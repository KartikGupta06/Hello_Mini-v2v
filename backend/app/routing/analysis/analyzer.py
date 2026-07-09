import asyncio
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.routing.schemas.schemas import (
    RouteCoordinate, 
    RouteStatistics, 
    RouteHotspot, 
    RouteAnalysisResult
)
from app.ai.services.ai_service import AIService
from app.routing.sampling.sampler import RouteSampler

class RouteAnalyzer:
    def __init__(self):
        """Initializes route sampler dependency."""
        self.sampler = RouteSampler()

    async def analyze_route(
        self, 
        route_id: str, 
        route_name: str, 
        coordinates: List[RouteCoordinate], 
        db: Session = None
    ) -> RouteAnalysisResult:
        """Samples route path, evaluates coordinates safety levels, aggregates stats, and marks risk hotspots."""
        # 1. Sample coordinates
        sampled_points = self.sampler.sample_coordinates(coordinates)
        if not sampled_points:
            raise ValueError(f"Route {route_name} contains empty coordinates.")

        # 2. Concurrently fetch safety scores
        tasks = []
        for pt in sampled_points:
            tasks.append(AIService.get_safety_score_for_coordinates(lat=pt.lat, lng=pt.lng, db=db))

        ai_results = await asyncio.gather(*tasks)

        # 3. Calculate statistics
        scores = [res.safety_score for res in ai_results]
        confidences = [res.confidence_percentage for res in ai_results]
        categories = [res.risk_category for res in ai_results]

        avg_safety = sum(scores) / len(scores)
        min_safety = min(scores)
        max_safety = max(scores)
        
        sorted_scores = sorted(scores)
        n = len(sorted_scores)
        median_safety = (sorted_scores[n//2] + sorted_scores[(n-1)//2]) / 2.0
        
        avg_conf = sum(confidences) / len(confidences)

        # Compute risk category distributions
        distribution = {
            "Very Safe": 0.0,
            "Safe": 0.0,
            "Moderate": 0.0,
            "Risky": 0.0,
            "High Risk": 0.0,
            "Critical": 0.0
        }
        for cat in categories:
            if cat in distribution:
                distribution[cat] += 1.0
                
        for k in distribution.keys():
            distribution[k] = round((distribution[k] / len(categories)) * 100.0, 2)

        # Segment thresholds (Safe >= 70, Unsafe < 70)
        safe_count = sum(1 for s in scores if s >= 70.0)
        unsafe_count = len(scores) - safe_count

        stats = RouteStatistics(
            avg_safety_score=round(avg_safety, 2),
            min_safety_score=round(min_safety, 2),
            max_safety_score=round(max_safety, 2),
            median_safety_score=round(median_safety, 2),
            avg_confidence=round(avg_conf, 2),
            risk_distribution=distribution,
            safe_segments_count=safe_count,
            unsafe_segments_count=unsafe_count
        )

        # 4. Hotspots detection
        hotspots = []
        
        # Unsafe cluster check: consecutive points where score < 50
        in_cluster = False
        cluster_start = -1
        
        for i in range(len(scores)):
            if scores[i] < 50.0:
                if not in_cluster:
                    in_cluster = True
                    cluster_start = i
            else:
                if in_cluster:
                    # Check if region size >= 2
                    if i - cluster_start >= 2:
                        hotspots.append(RouteHotspot(
                            type="unsafe_cluster",
                            description=f"Continuous unsafe segment spanning {i - cluster_start} sampled coordinates with safety scores below 50.",
                            start_index=cluster_start,
                            end_index=i - 1,
                            coordinates=sampled_points[cluster_start:i]
                        ))
                    in_cluster = False
                    
        # Catch cluster extending to last element
        if in_cluster and len(scores) - cluster_start >= 2:
            hotspots.append(RouteHotspot(
                type="unsafe_cluster",
                description=f"Continuous unsafe segment extending to destination with safety scores below 50.",
                start_index=cluster_start,
                end_index=len(scores) - 1,
                coordinates=sampled_points[cluster_start:]
            ))

        # Sudden score drop checks
        for i in range(len(scores) - 1):
            drop = scores[i] - scores[i+1]
            if drop > 25.0:
                hotspots.append(RouteHotspot(
                    type="sudden_drop",
                    description=f"Sudden safety score drop of {round(drop, 1)} points between segments.",
                    start_index=i,
                    end_index=i + 1,
                    coordinates=[sampled_points[i], sampled_points[i+1]]
                ))

        return RouteAnalysisResult(
            route_id=route_id,
            route_name=route_name,
            sampled_points_count=len(sampled_points),
            statistics=stats,
            hotspots=hotspots
        )
