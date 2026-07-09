import math
from typing import List
from app.routing.schemas.schemas import RouteCoordinate

class RouteSampler:
    @staticmethod
    def haversine_distance(c1: RouteCoordinate, c2: RouteCoordinate) -> float:
        """Computes Haversine distance in meters between two coordinates."""
        R = 6371000.0  # Earth's radius in meters
        lat1, lon1 = math.radians(c1.lat), math.radians(c1.lng)
        lat2, lon2 = math.radians(c2.lat), math.radians(c2.lng)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def sample_coordinates(
        self, 
        coordinates: List[RouteCoordinate], 
        default_interval_meters: float = 150.0,
        max_samples: int = 20
    ) -> List[RouteCoordinate]:
        """Samples coordinates along the route polyline using distance constraints and adaptive limits."""
        if not coordinates:
            return []
        if len(coordinates) <= 2:
            return coordinates

        # 1. Calculate cumulative distances along the path
        segment_distances = []
        total_distance = 0.0
        for i in range(len(coordinates) - 1):
            dist = self.haversine_distance(coordinates[i], coordinates[i+1])
            segment_distances.append(dist)
            total_distance += dist

        # 2. Adaptive interval scaling: if route distance is large, expand interval to respect max cap
        interval = default_interval_meters
        if (total_distance / interval) > (max_samples - 1):
            interval = total_distance / (max_samples - 1)

        # 3. Sample points at interval steps
        sampled = [coordinates[0]]  # Always include starting coordinate
        accumulated_dist = 0.0
        next_target_dist = interval

        for i in range(len(coordinates) - 1):
            dist = segment_distances[i]
            # Check if this segment contains one or more sample intervals
            while accumulated_dist + dist >= next_target_dist:
                # Interpolate coordinate matching next_target_dist
                segment_pct = (next_target_dist - accumulated_dist) / dist if dist > 0 else 0.0
                
                lat_interp = coordinates[i].lat + segment_pct * (coordinates[i+1].lat - coordinates[i].lat)
                lng_interp = coordinates[i].lng + segment_pct * (coordinates[i+1].lng - coordinates[i].lng)
                
                sampled.append(RouteCoordinate(lat=lat_interp, lng=lng_interp))
                next_target_dist += interval

            accumulated_dist += dist

        # Always append end destination coordinate if not already present
        last_coord = coordinates[-1]
        if self.haversine_distance(sampled[-1], last_coord) > 5.0 and len(sampled) < max_samples:
            sampled.append(last_coord)
        elif len(sampled) >= max_samples:
            # Overwrite last sample to ensure destination is exactly capped
            sampled[-1] = last_coord

        return sampled
