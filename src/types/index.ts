export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  relationship_type?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export type ReportCategory =
  | "Street Light Issue"
  | "Harassment"
  | "Stalking"
  | "Broken CCTV"
  | "Road Block"
  | "Poor Lighting"
  | "Suspicious Activity"
  | "Other";

export interface SafetyReport {
  id: number;
  user_id?: number | null;
  lat: number;
  lng: number;
  type: ReportCategory;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SafeHaven {
  id: string;
  name: string;
  type: "police_station" | "hospital" | "fire_station" | "open_shop" | "medical_center";
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
}

export interface JourneyHistory {
  id: number;
  user_id: number;
  origin: string;
  destination: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  safety_score?: number | null;
  status: string;
  duration_seconds?: number | null;
  completed_at?: string | null;
  journey_metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// Coordinate Pydantic matching model
export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface CandidateRouteInput {
  id: string;
  name: string;
  coordinates: RouteCoordinate[];
  distance_meters: number;
  time_seconds: number;
}

export interface RouteDetail {
  id: string;
  name: string;
  coordinates: RouteCoordinate[];
  distance_meters: number;
  time_seconds: number;
  avg_safety_score?: number;
  safetyScore?: number; // fallback compatibility
}

export interface RouteHotspot {
  type: "unsafe_cluster" | "sudden_drop";
  description: string;
  start_index: number;
  end_index: number;
  coordinates: RouteCoordinate[];
}

export interface RouteStatistics {
  avg_safety_score: number;
  min_safety_score: number;
  max_safety_score: number;
  median_safety_score: number;
  avg_confidence: number;
  risk_distribution: Record<string, number>;
  safe_segments_count: number;
  unsafe_segments_count: number;
}

export interface RouteAnalysisResult {
  route_id: string;
  route_name: string;
  sampled_points_count: number;
  statistics: RouteStatistics;
  hotspots: RouteHotspot[];
}

export interface RouteRankingItem {
  route_id: string;
  route_name: string;
  rank: number;
  rank_score: number;
  avg_safety_score: number;
  travel_time_seconds: number;
  travel_distance_meters: number;
}

export interface RouteRecommendationResponse {
  recommended_route_id: string;
  recommendation_reason: string;
  trade_offs_summary: string;
  rankings: RouteRankingItem[];
  detailed_analyses: RouteAnalysisResult[];
}
