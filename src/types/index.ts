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

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface RouteIntelligencePayload {
  source_lat: number;
  source_lng: number;
  dest_lat: number;
  dest_lng: number;
}

export interface AIExplanation {
  why_this_route?: string[];
  risks_and_warnings?: string[];
}

export interface AnalyzedRoute {
  route_id: string;
  route_name: string;
  coordinates: RouteCoordinate[];
  distance: number;
  eta: number;
  safety_score: number;
  risk_level: string;
  confidence: number;
  emergency_readiness: number;
  ai_explanation: AIExplanation;
}

export interface RouteIntelligenceResponse {
  recommended_route: AnalyzedRoute | null;
  alternative_routes: AnalyzedRoute[];
}

