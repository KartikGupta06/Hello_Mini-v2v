from typing import List
from app.routing.schemas.schemas import RouteRankingItem, RouteAnalysisResult, CandidateRouteInput

class RouteRanker:
    # Configurable ranking score weight parameters
    SAFETY_WEIGHT: float = 0.50
    WORST_SEGMENT_WEIGHT: float = 0.20
    CONFIDENCE_WEIGHT: float = 0.10
    TIME_PENALTY_WEIGHT: float = 0.01       # 0.01 deduction per second
    DISTANCE_PENALTY_WEIGHT: float = 0.0001 # 0.0001 deduction per meter
    HOTSPOT_PENALTY: float = 5.0            # 5.0 deduction per hotspot detected

    def rank_routes(
        self, 
        candidate_inputs: List[CandidateRouteInput], 
        analyses: List[RouteAnalysisResult]
    ) -> List[RouteRankingItem]:
        """Calculates ranking scores for candidates using safety coefficients and transit penalties."""
        ranking_items = []
        
        # Map inputs by route_id
        input_map = {inp.id: inp for inp in candidate_inputs}

        for analysis in analyses:
            route_id = analysis.route_id
            inp = input_map.get(route_id)
            if not inp:
                continue

            stats = analysis.statistics
            hotspots_count = len(analysis.hotspots)

            # 1. Compute components
            avg_safety = stats.avg_safety_score if stats.avg_safety_score is not None else 0.0
            min_safety = stats.min_safety_score if stats.min_safety_score is not None else 0.0
            
            avg_safety_comp = avg_safety * self.SAFETY_WEIGHT
            worst_seg_comp = min_safety * self.WORST_SEGMENT_WEIGHT
            conf_comp = stats.avg_confidence * self.CONFIDENCE_WEIGHT
            
            time_penalty = inp.time_seconds * self.TIME_PENALTY_WEIGHT
            dist_penalty = inp.distance_meters * self.DISTANCE_PENALTY_WEIGHT
            hotspot_penalty = hotspots_count * self.HOTSPOT_PENALTY

            # 2. Sum overall rank score
            score = avg_safety_comp + worst_seg_comp + conf_comp - time_penalty - dist_penalty - hotspot_penalty
            score = round(score, 2)

            ranking_items.append(RouteRankingItem(
                route_id=route_id,
                route_name=analysis.route_name,
                rank=1,  # Set temporarily, will sort and index later
                rank_score=score,
                avg_safety_score=stats.avg_safety_score,
                travel_time_seconds=inp.time_seconds,
                travel_distance_meters=inp.distance_meters
            ))

        # 3. Sort descending by score
        ranking_items.sort(key=lambda r: r.rank_score, reverse=True)

        # 4. Map ranks [1, 2, ...]
        for idx, item in enumerate(ranking_items):
            item.rank = idx + 1

        return ranking_items
