import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.routing.schemas.schemas import CandidateRouteInput, RouteCoordinate
from app.utils.spatial import haversine_distance
import polyline
import asyncio


class ORSService:
    """Service to integrate with OpenRouteService."""
    
    BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"

    def validate_and_correct_coordinates(
        self,
        source_lat: float,
        source_lng: float,
        dest_lat: float,
        dest_lng: float
    ) -> tuple[float, float, float, float]:
        """
        Validates coordinate ranges, catches and auto-corrects swapped coordinate pairs
        for both local (India) and global coordinate domains.
        """
        # 1. Catch swapped coordinates inside India bounding box
        # Latitude range [8.0, 38.0], Longitude range [68.0, 98.0]
        if (68.0 <= source_lat <= 98.0) and (8.0 <= source_lng <= 38.0):
            source_lat, source_lng = source_lng, source_lat
        if (68.0 <= dest_lat <= 98.0) and (8.0 <= dest_lng <= 38.0):
            dest_lat, dest_lng = dest_lng, dest_lat

        # 2. General swapped coordinates fallback where lat > 90 or lng looks like lat
        if abs(source_lat) > 90.0 or abs(dest_lat) > 90.0:
            if abs(source_lng) <= 90.0 and abs(source_lat) <= 180.0:
                source_lat, source_lng = source_lng, source_lat
            if abs(dest_lng) <= 90.0 and abs(dest_lat) <= 180.0:
                dest_lat, dest_lng = dest_lng, dest_lat

        # 3. Strictly validate ranges
        if not (-90.0 <= source_lat <= 90.0) or not (-180.0 <= source_lng <= 180.0):
            raise ValueError(f"Invalid source coordinates: lat={source_lat}, lng={source_lng}")
        if not (-90.0 <= dest_lat <= 90.0) or not (-180.0 <= dest_lng <= 180.0):
            raise ValueError(f"Invalid destination coordinates: lat={dest_lat}, lng={dest_lng}")

        return source_lat, source_lng, dest_lat, dest_lng

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
        Coordinates are validated and passed to ORS as [longitude, latitude].
        """
        # Validate and correct swapped inputs before any operations
        source_lat, source_lng, dest_lat, dest_lng = self.validate_and_correct_coordinates(
            source_lat, source_lng, dest_lat, dest_lng
        )

        # Check for distance limit (prevent routes exceeding OpenRouteService limits, e.g. 1000 km)
        straight_line_dist = haversine_distance(source_lat, source_lng, dest_lat, dest_lng)
        if straight_line_dist > 1000000.0: # 1000 km
            raise ValueError(f"Requested route distance ({round(straight_line_dist/1000, 1)}km) exceeds OpenRouteService limit of 1000km.")

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
        
        # Exponential backoff retry mechanism (max 3 attempts)
        async with httpx.AsyncClient(timeout=10.0) as client:
            for attempt in range(3):
                try:
                    response = await client.post(self.BASE_URL, json=body, headers=headers)
                    if response.status_code == 200:
                        data = response.json()
                        return self._parse_ors_response(data)
                    elif response.status_code == 429:
                        # Rate limit error: exponential backoff wait
                        if attempt == 2:
                            raise Exception("OpenRouteService API rate limit exceeded (429). Please try again later.")
                        await asyncio.sleep(2 ** attempt)
                    else:
                        raise Exception(f"OpenRouteService error: {response.status_code} - {response.text}")
                except (httpx.RequestError, asyncio.TimeoutError) as e:
                    if attempt == 2:
                        raise Exception(f"Failed to connect to OpenRouteService: {str(e)}")
                    await asyncio.sleep(2 ** attempt)
            
            raise Exception("Failed to fetch routes from OpenRouteService after retries.")

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
