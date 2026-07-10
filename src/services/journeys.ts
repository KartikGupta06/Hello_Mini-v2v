import { fetchJson } from "../lib/api";
import { JourneyHistory } from "../types";

export const JourneyService = {
  // Fetch user journeys
  getJourneys: async (params?: { skip?: number; limit?: number; sort_by?: string; order?: string }): Promise<JourneyHistory[]> => {
    const queryParts: string[] = [];
    if (params?.skip !== undefined) queryParts.push(`skip=${params.skip}`);
    if (params?.limit !== undefined) queryParts.push(`limit=${params.limit}`);
    if (params?.sort_by) queryParts.push(`sort_by=${params.sort_by}`);
    if (params?.order) queryParts.push(`order=${params.order}`);
    
    const queryStr = queryParts.length ? `?${queryParts.join("&")}` : "";
    return fetchJson<JourneyHistory[]>(`/journeys${queryStr}`);
  },

  // Save new navigation journey log
  createJourney: async (journey: {
    origin: string;
    destination: string;
    origin_lat: number;
    origin_lng: number;
    dest_lat: number;
    dest_lng: number;
    user_id: number;
    safety_score?: number;
    status?: string;
    duration_seconds?: number;
    journey_metadata?: Record<string, any>;
  }): Promise<JourneyHistory> => {
    return fetchJson<JourneyHistory>("/journeys", {
      method: "POST",
      body: JSON.stringify(journey),
    });
  },

  // Get specific journey details
  getJourney: async (id: number): Promise<JourneyHistory> => {
    return fetchJson<JourneyHistory>(`/journeys/${id}`);
  },

  // Update journey status or metadata
  updateJourney: async (id: number, updates: {
    status?: string;
    duration_seconds?: number;
    completed_at?: string;
    journey_metadata?: Record<string, any>;
  }): Promise<JourneyHistory> => {
    return fetchJson<JourneyHistory>(`/journeys/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Delete journey item from log
  deleteJourney: async (id: number): Promise<JourneyHistory> => {
    return fetchJson<JourneyHistory>(`/journeys/${id}`, {
      method: "DELETE",
    });
  }
};
