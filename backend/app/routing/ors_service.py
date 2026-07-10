import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.routing.schemas.schemas import CandidateRouteInput, RouteCoordinate
import polyline

class ORSService:
    """Service to integrate with OpenRouteService."""
    
    BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"

    async def get_alternative_routes(
        self, 
        source_lat: float, 
        source_lng: float, 
        dest_lat: float, 
        dest_lng: float,
        target_count: int = 3
    ) -> List[CandidateRouteInput]:
        """
        Fetches alternative routes from ORS between source and destination.
        Coordinates are passed to ORS as [longitude, latitude].
        """
        headers = {
            "Authorization": settings.ORS_API_KEY,
            "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
            "Content-Type": "application/json"
        }
        
        body = {
            "coordinates": [[source_lng, source_lat], [dest_lng, dest_lat]],
            "alternative_routes": {
                "target_count": target_count,
                "weight_factor": 1.4,
                "share_factor": 0.6
            }
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(self.BASE_URL, json=body, headers=headers)
                if response.status_code != 200:
                    raise Exception(f"OpenRouteService error: {response.status_code} - {response.text}")
                    
                data = response.json()
                return self._parse_ors_response(data)
            except httpx.RequestError as e:
                raise Exception(f"Failed to connect to OpenRouteService: {str(e)}")

    def _parse_ors_response(self, data: Dict[str, Any]) -> List[CandidateRouteInput]:
        routes = data.get("routes", [])
        candidate_routes = []
        
        for i, route in enumerate(routes):
            geom_encoded = route.get("geometry")
            summary = route.get("summary", {})
            distance = summary.get("distance", 0.0)
            duration = summary.get("duration", 0.0)
            
            # ORS polyline returns (lat, lng) when decoded
            coords = polyline.decode(geom_encoded)
            route_coords = [RouteCoordinate(lat=lat, lng=lng) for lat, lng in coords]
            
            candidate = CandidateRouteInput(
                id=f"route_{i+1}",
                name=f"Alternative Route {i+1}",
                coordinates=route_coords,
                distance_meters=distance,
                time_seconds=duration
            )
            candidate_routes.append(candidate)
            
        return candidate_routes
