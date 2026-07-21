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
        raw_scores = [res.safety_score for res in ai_results]
        scores = [s for s in raw_scores if s is not None]
        
        confidences = [res.confidence_percentage for res in ai_results]
        categories = [res.risk_category for res in ai_results]

        if scores:
            avg_safety = sum(scores) / len(scores)
            min_safety = min(scores)
            max_safety = max(scores)
            
            sorted_scores = sorted(scores)
            n = len(sorted_scores)
            median_safety = (sorted_scores[n//2] + sorted_scores[(n-1)//2]) / 2.0
        else:
            avg_safety = None
            min_safety = None
            max_safety = None
            median_safety = None
            
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0

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
            avg_safety_score=round(avg_safety, 2) if avg_safety is not None else None,
            min_safety_score=round(min_safety, 2) if min_safety is not None else None,
            max_safety_score=round(max_safety, 2) if max_safety is not None else None,
            median_safety_score=round(median_safety, 2) if median_safety is not None else None,
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
        
        for i in range(len(raw_scores)):
            s = raw_scores[i]
            # Treat None as unsafe for cluster detection to warn about unmapped areas
            is_unsafe = s is None or s < 50.0
            
            if is_unsafe:
                if not in_cluster:
                    in_cluster = True
                    cluster_start = i
            else:
                if in_cluster:
                    # Check if region size >= 2
                    if i - cluster_start >= 2:
                        hotspots.append(RouteHotspot(
                            type="unsafe_cluster",
                            description=f"Continuous unsafe or unmapped segment spanning {i - cluster_start} sampled coordinates.",
                            start_index=cluster_start,
                            end_index=i - 1,
                            coordinates=sampled_points[cluster_start:i]
                        ))
                    in_cluster = False
                    
        # Catch cluster extending to last element
        if in_cluster and len(raw_scores) - cluster_start >= 2:
            hotspots.append(RouteHotspot(
                type="unsafe_cluster",
                description=f"Continuous unsafe or unmapped segment extending to destination.",
                start_index=cluster_start,
                end_index=len(raw_scores) - 1,
                coordinates=sampled_points[cluster_start:]
            ))

        # Sudden score drop checks
        for i in range(len(raw_scores) - 1):
            s1 = raw_scores[i]
            s2 = raw_scores[i+1]
            if s1 is not None and s2 is not None:
                drop = s1 - s2
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
