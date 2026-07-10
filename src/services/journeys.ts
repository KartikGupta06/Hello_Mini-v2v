import { fetchJson } from "../lib/api";
import { JourneyHistory } from "../types";
import { AuthService } from "./auth";

const MOCK_JOURNEYS: JourneyHistory[] = [
  {
    id: 8881,
    user_id: 9999,
    origin: "Saket Metro District, South Delhi",
    destination: "Malviya Nagar Police Station Area, South Delhi",
    origin_lat: 28.5233,
    origin_lng: 77.2083,
    dest_lat: 28.5306,
    dest_lng: 77.2045,
    safety_score: 94,
    status: "completed",
    duration_seconds: 720,
    completed_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    journey_metadata: {
      route_id: "safest",
      distance: "1.2 km",
      time: "12 min",
      hotspots_count: 0
    },
    created_at: new Date(Date.now() - 2.2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 8882,
    user_id: 9999,
    origin: "Mehrauli Park Area, South Delhi",
    destination: "Saket Metro District, South Delhi",
    origin_lat: 28.5262,
    origin_lng: 77.1779,
    dest_lat: 28.5233,
    dest_lng: 77.2083,
    safety_score: 81,
    status: "completed",
    duration_seconds: 1440,
    completed_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    journey_metadata: {
      route_id: "balanced",
      distance: "3.2 km",
      time: "24 min",
      hotspots_count: 1
    },
    created_at: new Date(Date.now() - 24.4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

const getDevJourneys = (): JourneyHistory[] => {
  if (typeof window === "undefined") return MOCK_JOURNEYS;
  const stored = localStorage.getItem("dev_journeys");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return MOCK_JOURNEYS;
    }
  }
  localStorage.setItem("dev_journeys", JSON.stringify(MOCK_JOURNEYS));
  return MOCK_JOURNEYS;
};

const saveDevJourneys = (journeys: JourneyHistory[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("dev_journeys", JSON.stringify(journeys));
  }
};

export const JourneyService = {
  // Fetch user journeys
  getJourneys: async (params?: { skip?: number; limit?: number; sort_by?: string; order?: string }): Promise<JourneyHistory[]> => {
    try {
      // Direct call
      return await fetchJson<JourneyHistory[]>("/journeys");
    } catch (e) {
      if (AuthService.isDevMode()) {
        console.warn("API getJourneys failed, using dev fallbacks:", e);
        return getDevJourneys();
      }
      throw e;
    }
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
    try {
      return await fetchJson<JourneyHistory>("/journeys", {
        method: "POST",
        body: JSON.stringify(journey),
      });
    } catch (e) {
      if (AuthService.isDevMode()) {
        console.warn("API createJourney failed, using dev fallbacks:", e);
        const journeys = getDevJourneys();
        const newJourney: JourneyHistory = {
          id: Math.floor(Math.random() * 100000),
          user_id: journey.user_id,
          origin: journey.origin,
          destination: journey.destination,
          origin_lat: journey.origin_lat,
          origin_lng: journey.origin_lng,
          dest_lat: journey.dest_lat,
          dest_lng: journey.dest_lng,
          safety_score: journey.safety_score || 85,
          status: journey.status || "active",
          duration_seconds: journey.duration_seconds || 0,
          completed_at: null,
          journey_metadata: journey.journey_metadata || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const updated = [newJourney, ...journeys];
        saveDevJourneys(updated);
        return newJourney;
      }
      throw e;
    }
  },

  // Get specific journey details
  getJourney: async (id: number): Promise<JourneyHistory> => {
    try {
      return await fetchJson<JourneyHistory>(`/journeys/${id}`);
    } catch (e) {
      if (AuthService.isDevMode()) {
        console.warn("API getJourney failed, using dev fallbacks:", e);
        const journeys = getDevJourneys();
        const target = journeys.find(j => j.id === id);
        if (target) return target;
      }
      throw e;
    }
  },

  // Update journey status or metadata
  updateJourney: async (id: number, updates: {
    status?: string;
    duration_seconds?: number;
    completed_at?: string;
    journey_metadata?: Record<string, any>;
  }): Promise<JourneyHistory> => {
    try {
      return await fetchJson<JourneyHistory>(`/journeys/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    } catch (e) {
      if (AuthService.isDevMode()) {
        console.warn("API updateJourney failed, using dev fallbacks:", e);
        const journeys = getDevJourneys();
        const target = journeys.find(j => j.id === id);
        if (!target) throw e;
        Object.assign(target, updates);
        if (updates.status === "completed") {
          target.completed_at = new Date().toISOString();
        }
        target.updated_at = new Date().toISOString();
        saveDevJourneys(journeys);
        return target;
      }
      throw e;
    }
  },

  // Delete journey item from log
  deleteJourney: async (id: number): Promise<JourneyHistory> => {
    try {
      return await fetchJson<JourneyHistory>(`/journeys/${id}`, {
        method: "DELETE",
      });
    } catch (e) {
      if (AuthService.isDevMode()) {
        console.warn("API deleteJourney failed, using dev fallbacks:", e);
        const journeys = getDevJourneys();
        const target = journeys.find(j => j.id === id);
        if (!target) throw e;
        const filtered = journeys.filter(j => j.id !== id);
        saveDevJourneys(filtered);
        return target;
      }
      throw e;
    }
  }
};
