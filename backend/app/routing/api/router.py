import asyncio
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.routing.schemas.schemas import CandidateRouteInput, RouteRecommendationResponse
from app.routing.analysis.analyzer import RouteAnalyzer
from app.routing.ranking.ranker import RouteRanker
from app.routing.recommendation.recommendation import RecommendationEngine

router = APIRouter()

@router.post(
    "/analyze",
    response_model=RouteRecommendationResponse,
    summary="Analyze and rank multiple candidate routes",
    description="Processes route coordinate polylines concurrently to detect hotspots, rank them, and return trade-off recommendations."
)
async def analyze_routes(
    routes: List[CandidateRouteInput],
    db: Session = Depends(get_db)
):
    analyzer = RouteAnalyzer()
    ranker = RouteRanker()
    recommender = RecommendationEngine()

    # 1. Analyze each candidate route concurrently
    tasks = []
    for r in routes:
        tasks.append(analyzer.analyze_route(
            route_id=r.id,
            route_name=r.name,
            coordinates=r.coordinates,
            db=db
        ))

    analyses = await asyncio.gather(*tasks)

    # 2. Rank candidates using weights
    rankings = ranker.rank_routes(routes, list(analyses))

    # 3. Generate recommendation trade-offs
    rec_id, rec_reason, trade_offs = recommender.generate_recommendation(
        candidate_inputs=routes,
        rankings=rankings,
        analyses=list(analyses)
    )

    return RouteRecommendationResponse(
        recommended_route_id=rec_id,
        recommendation_reason=rec_reason,
        trade_offs_summary=trade_offs,
        rankings=rankings,
        detailed_analyses=list(analyses)
    )
