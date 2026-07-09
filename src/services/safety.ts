import { fetchJson } from "../lib/api";
import { RouteDetail, SafetyReport, SafeHaven } from "../types";

export const SafetyService = {
  getRoutes: async (origin: string, destination: string): Promise<RouteDetail[]> => {
    return fetchJson<RouteDetail[]>(`/routes?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  },

  submitReport: async (report: Omit<SafetyReport, "id" | "createdAt">): Promise<SafetyReport> => {
    return fetchJson<SafetyReport>("/reports", {
      method: "POST",
      body: JSON.stringify(report),
    });
  },

  getSafeHavens: async (lat: number, lng: number): Promise<SafeHaven[]> => {
    return fetchJson<SafeHaven[]>(`/havens?lat=${lat}&lng=${lng}`);
  }
};
