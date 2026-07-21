import { apiClient } from "../lib/api";
import { 
  SafeHaven, 
  SafetyReport, 
  ReportCategory,
  RouteIntelligencePayload,
  RouteIntelligenceResponse
} from "../types";

export const SafetyService = {
  // Post route coordinates to obtain analysis, ranking, and explainable safety details
  getRouteIntelligence: async (payload: RouteIntelligencePayload): Promise<RouteIntelligenceResponse> => {
    return apiClient.post<RouteIntelligenceResponse>("/routes/intelligence", payload);
  },

  // Submit hazard reports
  submitReport: async (report: { lat: number; lng: number; type: ReportCategory; description: string; user_id?: number }): Promise<SafetyReport> => {
    return apiClient.post<SafetyReport>("/reports", report);
  },

  // Query community reported hazards
  getReports: async (params?: { limit?: number; offset?: number; type?: string; search?: string }): Promise<SafetyReport[]> => {
    const queryParts: string[] = [];
    if (params?.limit !== undefined) queryParts.push(`limit=${params.limit}`);
    if (params?.offset !== undefined) queryParts.push(`offset=${params.offset}`);
    if (params?.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    
    const queryStr = queryParts.length ? `?${queryParts.join("&")}` : "";
    return apiClient.get<SafetyReport[]>(`/reports${queryStr}`);
  },

  // Fetch coordinates safety score and explainable reasons
  getSafetyScore: async (lat: number, lng: number): Promise<{
    safety_score: number;
    confidence_level: string;
    confidence_percentage: number;
    risk_category: string;
    reasons: string[];
    module_breakdown: Record<string, any>;
    coverage?: boolean;
    ai_explanation?: { why_this_route: string };
  }> => {
    return apiClient.get(`/ai/safety-score?lat=${lat}&lng=${lng}`);
  },

  // Query police stations infrastructure
  getPoliceStations: async (district?: string): Promise<{ data: SafeHaven[]; total: number }> => {
    const query = district ? `?district=${encodeURIComponent(district)}` : "";
    const response = await apiClient.get<{ success: boolean; data: any[]; total: number }>(`/police-stations/${query}`);
    return {
      total: response.total,
      data: response.data.map(item => ({
        id: item.station_id,
        name: item.station_name,
        type: "police_station" as const,
        lat: item.latitude,
        lng: item.longitude,
        address: item.address,
        phone: item.contact_number
      }))
    };
  },

  // Query hospitals infrastructure
  getHospitals: async (district?: string): Promise<{ data: SafeHaven[]; total: number }> => {
    const query = district ? `?district=${encodeURIComponent(district)}` : "";
    const response = await apiClient.get<{ success: boolean; data: any[]; total: number }>(`/hospitals/${query}`);
    return {
      total: response.total,
      data: response.data.map(item => ({
        id: item.hospital_id,
        name: item.hospital_name,
        type: "hospital" as const,
        lat: item.latitude,
        lng: item.longitude,
        address: item.address,
        phone: item.contact_number
      }))
    };
  },

  // Trigger SOS Emergency
  triggerSOS: async (payload: { latitude?: number; longitude?: number }): Promise<any> => {
    return apiClient.post("/sos/trigger", payload);
  },

  // Update incident report
  updateReport: async (id: number, updates: { type?: ReportCategory; description?: string; lat?: number; lng?: number }): Promise<SafetyReport> => {
    return apiClient.put<SafetyReport>(`/reports/${id}`, updates);
  },

  // Delete incident report
  deleteReport: async (id: number): Promise<SafetyReport> => {
    return apiClient.delete<SafetyReport>(`/reports/${id}`);
  }
};
