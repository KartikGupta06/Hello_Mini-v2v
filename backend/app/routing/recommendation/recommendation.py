from typing import List, Tuple
from app.routing.schemas.schemas import RouteRankingItem, RouteAnalysisResult, CandidateRouteInput

class RecommendationEngine:
    def generate_recommendation(
        self, 
        candidate_inputs: List[CandidateRouteInput], 
        rankings: List[RouteRankingItem], 
        analyses: List[RouteAnalysisResult]
    ) -> Tuple[str, str, str]:
        """Compares ranked candidate routes producing detailed trade-off summaries and reasons."""
        if not rankings:
            return "", "No candidate routes provided.", "N/A"

        recommended_rank = rankings[0]
        rec_id = recommended_rank.route_id
        
        # Resolve recommended analysis details
        rec_analysis = next((a for a in analyses if a.route_id == rec_id), None)
        rec_input = next((inp for inp in candidate_inputs if inp.id == rec_id), None)

        if len(rankings) == 1 or not rec_analysis or not rec_input:
            reason = f"Route {recommended_rank.route_name} is recommended as it is the only candidate route evaluated."
            trade_off = "No alternative routes available for comparative trade-off analysis."
            return rec_id, reason, trade_off

        # Identify alternative: find fastest route
        fastest_input = min(candidate_inputs, key=lambda r: r.time_seconds)
        fastest_id = fastest_input.id
        fastest_rank = next((r for r in rankings if r.route_id == fastest_id), None)
        fastest_analysis = next((a for a in analyses if a.route_id == fastest_id), None)

        # If recommended is already the fastest route
        if rec_id == fastest_id:
            reason = f"Route {recommended_rank.route_name} is highly recommended. It represents both the safest path (avg safety {recommended_rank.avg_safety_score}) and the fastest transit route option."
            trade_off = "Optimal balance achieved: no time or safety trade-offs required."
            return rec_id, reason, trade_off

        # Recommended is safer but slower than fastest alternative
        time_diff_sec = rec_input.time_seconds - fastest_input.time_seconds
        time_diff_min = int(time_diff_sec / 60)
        if time_diff_min == 0:
            time_diff_min = 1

        rec_safety = recommended_rank.avg_safety_score if recommended_rank.avg_safety_score is not None else 0.0
        alt_safety_raw = fastest_rank.avg_safety_score if fastest_rank else rec_safety
        alt_safety = alt_safety_raw if alt_safety_raw is not None else 0.0
        safety_diff = rec_safety - alt_safety
        safety_diff_pct = (safety_diff / alt_safety * 100) if alt_safety > 0 else 0.0

        # Draft trade-off
        trade_off = f"This route is {time_diff_min} minute(s) longer but {round(safety_diff_pct, 1)}% safer than the fastest route option."

        # Extract reasoning metrics (e.g. check lighting, community reports, or POI differences)
        reasons_list = []
        rec_avg_stat = rec_analysis.statistics.avg_safety_score if rec_analysis.statistics.avg_safety_score is not None else 0.0
        alt_avg_stat = (fastest_analysis.statistics.avg_safety_score if fastest_analysis and fastest_analysis.statistics.avg_safety_score is not None else 0.0)
        
        if rec_avg_stat > alt_avg_stat:
            reasons_list.append("higher average safety ratings")
            
        rec_hotspots = len(rec_analysis.hotspots)
        alt_hotspots = len(fastest_analysis.hotspots) if fastest_analysis else 0
        if rec_hotspots < alt_hotspots:
            reasons_list.append("fewer high-risk hotspots")
            
        if rec_analysis.statistics.safe_segments_count > (fastest_analysis.statistics.safe_segments_count if fastest_analysis else 0):
            reasons_list.append("better lighting and security indicators along the path")

        if not reasons_list:
            reasons_list.append("more robust security scores")

        reason = f"Route {recommended_rank.route_name} is recommended over {fastest_input.name} due to " + ", ".join(reasons_list) + "."

        return rec_id, reason, trade_off
